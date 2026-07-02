---
title: 归因程序状态读写放大问题
date: 2026-07-02
tags: [Redis, 归因系统, 性能优化, BigKey]
excerpt: 线上一个 Redis key 涨到 100MB，从读写放大、BigKey 治理到结构改造的完整复盘。
---

事情是这样的。

前阵子我们线上有个 Redis key 涨到了快 100MB。

你可能对这个数字没太多概念，我给你找个参照。正常一个 Redis key 的 value，几 KB 到几十 KB 是常态，超过 1MB 就算偏胖了，10MB 级别的基本会被监控盯上。100MB 是什么概念呢，是 BigKey 里的 BigKey，读写一次都费劲，内存碎片化跟着一起来，搞不好还拖慢整个实例的响应。

而这个 key，是我们归因程序里存用户事件状态的。

要讲清楚这事，得先说说归因是干嘛的。

---

归因这个词，做广告或者做过增长的朋友应该不陌生。简单讲，用户点了广告主的链接，之后下载了 app 或者做了某个行为，广告主得知道这个用户是被哪个广告带来的，才能把钱结算给对应渠道。这个把用户行为归到某次广告点击上的过程，就叫归因。

听起来不难对吧。但实际跑起来有一堆麻烦事，比如点击和行为事件谁先到是不确定的。有时候用户先点了广告，过一会才下载 app，这个好办，点击在前行为在后，正常归因就行。但有时候反过来，用户的行为事件先到了，点击事件因为链路延迟晚到了几秒甚至几分钟，这时候你手里只有行为没有点击，你不知道该归给谁。

我们的处理方式是，先把这个行为当成「自然量」输出去，意思是它没有匹配到任何广告点击。然后把它暂时存在 Redis 里，等晚到的点击来了，如果时间窗口对得上，再把之前的结果覆盖成渠道量。

除了这个，还有首次归因、再归因、已归因用户的回传窗口管理，一堆逻辑都要依赖 Redis 里存的状态。

所以 Redis 里大概有这么几个 key。

| Key | 类型 | 说明 |
|-----|------|------|
| `attr:{appName}:{openId}` | String | 用户首次/再归因信息 |
| `active:{appName}:{openId}` | String | 用户最后活跃时间 |
| `clicks:{appName}:{openId}` | ZSet | 点击事件，score=clickTimestamp，member=clickJson |
| `events:{appName}:{openId}` | Hash | pending 自然量事件，field=logId，value=eventJson |
| `events_idx:{appName}:{openId}` | ZSet | pending 自然量事件过期索引，score=expireAt，member=logId |

整体逻辑不复杂，问题出在实现方式上。

---

第一个坑，读写放大。

原来的 events 是这么存的，一个 String，value 是一整个 JSON。也就是说一个用户的所有 pending 事件，全塞在一个 JSON Map 里。

这玩意一旦要新增或者删除一个事件，你得先把整个 JSON GET 出来，反序列化成对象，改一下，再序列化成 JSON，SET 回去。

你想想看，如果一个用户只有三五个 pending 事件，这个 JSON 也就几 KB，无所谓。但如果这个用户是个重度活跃用户，pending 事件攒了几千个呢，这个 JSON 可能就有好几 MB 了。然后你只是想加一个新事件进去，就得把这几 MB 的东西整体读出来再整体写回去。

这在 Redis 里叫读写放大，你本来只想改一个 field，结果把整个 value 搬了个来回。网络 IO 翻倍，CPU 也跟着烧。

---

这还只是第一个问题，更头疼的是第二个。

原来的逻辑里，所有归因事件到了都先写进 Redis。但问题是，如果一个事件没有匹配到点击，而且这个用户也没有历史归因状态，那这个事件就永远不会被清理，它会一直躺在 Redis 里。

你可能会想，那加个 TTL 不就行了。问题是原来没加，或者说加的粒度不对。

然后如果一个自然量用户特别活跃，隔三差五就来一个行为事件，每次都往这个 key 里塞一条，这个 events 的 value 就会无限增长。今天 1MB，下周 10MB，下个月可能就奔着 100MB 去了。

这就是我们开头说的那个 100MB 的 key 的由来。

---

好，问题讲完了，说说怎么解的。

核心思路就两条，把整体 JSON 拆开，以及给数量上个限。

先说拆。

把 events 从一个 String JSON 改成标准的 Redis Hash 加 ZSet。Hash 里 field 是 logId，value 是这条事件的 JSON。这样你要加一个事件就 HSET 一条，删一个就 HDEL 一条，不用碰其他事件，读写放大的问题直接没了。

```
events:{appName}:{openId}      Hash
    logId -> eventJson

events_idx:{appName}:{openId}  ZSet
    expireAt -> logId
```

ZSet 是配合 Hash 用的，当过期索引用。score 存过期时间，member 存 logId。为啥要这么搞，因为 Redis 的 Hash 是没有 field 级别 TTL 的，你没法说「这个 field 三天后自动过期」。所以用 ZSet 模拟一下，读取之前先扫一遍 ZSet，把过期的 logId 找出来，再去 Hash 里删掉。

写入 pending 事件的完整流程是这样的。

```
HSET eventsKey logId eventJson
ZADD eventsIdxKey expireAt logId
PEXPIRE eventsKey ttlMs+60000
PEXPIRE eventsIdxKey ttlMs+60000
```

读取之前先清理过期项。

```
ZRANGEBYSCORE eventsIdxKey -inf now
HDEL eventsKey expiredLogIds...
ZREM eventsIdxKey expiredLogIds...
HGETALL eventsKey
```

点击覆盖成功之后，把这个 logId 从 Hash 和 ZSet 里都删掉。

```
HDEL eventsKey logId
ZREM eventsIdxKey logId
```

这里有个细节我想多聊两句。你会注意到 Hash 和 ZSet 是两个 key，写一次要两条命令，读一次也涉及两次网络 IO。如果你对性能特别敏感，可以用 redis-pipeline 把它们打成一次网络往返。

但我们的判断是，先不优化这个。因为眼下最大的问题是 MB 级别的读写放大，这个改完之后每次操作只碰一个 field，量级从 MB 降到 KB，问题已经解决了。至于 QPS 层面的优化，过早优化反而容易把结构搞复杂，不值当。

PEXPIRE 是给 key 兜底用的，避免某个用户长期没有新事件进来，留一个空 key 或者索引 key 在那吃灰。

---

然后是第二条，给数量上限制。

前面那个改动解决了读写放大，但如果一个用户真的异常，疯狂产设备登录事件，pending 事件还是会越攒越多，BigKey 的风险还在。

所以加了个滚动上限，每个用户的 pending 事件最多存 1000 条。超过上限就丢掉最旧的，保留最新的。

这里有个取舍要注意。被丢掉的那些旧事件，相当于放弃了它们被晚到点击覆盖的机会。我们选的是 fail-open，就是宁可不覆盖也不让系统卡住，继续输出自然量结果，同时用一个 Flink 指标 `dropped_pending_events_over_limit` 来监控到底丢了多少。

如果这个指标一直涨，说明上游有异常，得去查。但它不应该成为阻塞正常流程的理由。

读取的时候也做了调整，不再 HGETALL 全量拉，而是先从 ZSet 索引里取出没过期的 logId，裁剪到上限之内，再 HMGET 精准取需要的几条。这样即使历史上有异常数据堆积，也不会一次性把 Flink 内存拉爆。

---

clicks 那边也有一样的问题，原来也是整体 JSON 存的，同样的读写放大。

顺手一起改了，从 String 改成 ZSet，score 是点击时间戳，member 是点击的 JSON。

```
clicks:{appName}:{openId}  ZSet
    score   = clickTimestamp
    member  = clickJson
```

写入就是一条 ZADD。

```
ZADD clicksKey clickTimestamp clickJson
```

查的时候，要找用户某个行为事件之前最近的一次点击，用 ZREVRANGEBYSCORE，给定一个时间范围，按时间倒序返回。

```
ZREVRANGEBYSCORE clicksKey eventTime+1000 eventTime-maxRecall
```

拿到结果之后，再按不同媒体自己的 recall window 二次过滤，返回第一条满足条件的点击就行。

这个改动有个额外的好处。Redis 侧直接按时间戳限定候选范围了，不用把所有点击都拉出来再在业务侧筛。而且返回结果天然按时间倒序，正好符合「最近一次点击」的语义，取第一条就完事。

---

最后说说现在跑起来的完整流程。

行为事件到达的时候，先查 clicks 这个 ZSet，找用户事件时间之前最近的一次有效点击。找到了就直接渠道归因，然后清理 clicks 里用过的数据。没找到点击，但用户可以首次归因，就输出自然量，同时把这条事件滚动写进 events Hash 和 events_idx ZSet 等着被覆盖。如果用户已经有归因状态了，就按历史归因信息回传，不写 events。最后更新一下 active 时间戳。

点击事件到达的时候，先判断这个点击在不在归因保护期外，是的话写进 clicks ZSet。然后清理 events_idx 里过期的 pending 事件。再读 events Hash 里还待覆盖的自然量事件。对满足时间窗口的事件重新做渠道归因。覆盖成功的，从 events 和 events_idx 里都删掉对应的 logId。

---

写到这里其实差不多讲完了，但我还想多说一句。

做这种优化，最难的从来不是想到方案。Hash 加 ZSet 替代 String JSON，但凡用过 Redis 的人都能想到。真正难的是判断，什么时候该动手，什么时候该忍着。

读写放大这事儿，如果用户量小，pending 事件永远就那么几条，它根本不是问题，你改了反而增加了维护成本。BigKey 也是，如果业务上自然量用户就没几个，它也涨不到 100MB。

但当你看到一个 key 真的涨到 100MB 的时候，就不是忍不忍的问题了，是必须得动了。而且这种东西越早改成本越低，等线上因为 BigKey 把 Redis 搞挂了再改，那个代价完全不是一个量级。

我们这次算是踩得不深，发现得早。顺手把 clicks 也一起治了，结构理顺了，后面再往上堆量也心里有底。

技术债这东西，说到底就是欠的时间。早还早轻松。
