前端跨域问题相信很多朋友都遇到过，很多时候我们都是直接交给后端来解决。那么为什么会出现跨域问题呢？后端是如何解决跨域问题？

# 什么是跨域？

广义的跨域包括：

- 资源跳转：<a>超链接</a>跳转、重定向、表单提交
- 资源嵌入：link、ifram、script、img，以及 css 样式中的 background：url()、@font-face()等外链接
- 脚本请求：js 的 ajax 请求、js 或 DOM 中的跨域操作

狭义的跨域：指浏览器同源策略限制的请求。我们通常所说的也指的是这种。

> **同源策略**是一个重要的安全策略，它用于限制一个 origin 的文档或者它加载的脚本如何能与另一个源的资源进行交互。它能帮助阻隔恶意文档，减少可能被攻击的媒介。

如果两个 URL 的 protocol、port (如果有指定的话)和 host 都相同的话，则这两个 URL 是**同源**。这个方案也被称为“协议/主机/端口元组”，或者直接是 “元组”。简单来说就是指"协议+域名+端口"三者都相同，如果有一个不同都会导致跨域，即使两个域名指向同一个 ip 也不会例外。以 `http://store.company.com/goods/list`为例

| URL                                    | 结果 | 原因                              |
| -------------------------------------- | ---- | --------------------------------- |
| http://store.company.com/goods/detail  | 同源 | 只有路径不同                      |
| http://store.company.com/my/info       | 同源 | 只有路径不同                      |
| https://store.company.com/goods/list   | 失败 | 协议不同                          |
| http://store.company.com:81/goods/list | 失败 | 端口不同 ( http:// 默认端口是 80) |
| http://news.company.com/goods/list     | 失败 | 主机不同                          |

# 跨域的方法

跨域的方法很多，网上案例很多 常见的大概有 9 种，分别是

1. jsonp 跨域
2. document.domain + iframe
3. window.name + iframe
4. location.hash + ifram
5. 跨域资源共享（CORS）
6. WebSocket 协议跨域
7. HTML5 的 postMessage 跨域
8. nginx 代理跨域
9. nodejs 中间件代理跨域

当然，在日常工作中，我们使用最多的还是**jsonp**和**CORS**两种，本文也只介绍着两种方式。

## 1.jsonp 跨域

jsonp 跨域的原理很简单，就是利用`script`标签不受同源策略限制这一特点来实现的。这也是 jsonp 的为什么**只支持 get 请求，而不支持 post 请求**的原因。通过动态创建 script 标签连接服务端，服务端通过函数执行的方式将 data 传递给前端。
代码以原生 js 为例：

```javascript
<script>
    var script = document.createElement('script');
    script.type = 'text/javascript';
    // 传参一个回调函数名给后端，方便后端返回时执行这个在前端定义的回调函数
    script.src = 'http://www.domain2.com:8080/login?user=admin&callback=handleCallback';
    document.head.appendChild(script);
    // 回调执行函数
    function handleCallback(res) {
        alert(JSON.stringify(res));
    }
 </script>
```

后端 node 代码实现：

```javascript
router.get('/article-list', (req, res) => {
  let data = {
    message: 'success!',
    name: req.query.name,
    age: req.query.age
  }
  const fn = req.query.callback
  data = JSON.stringify(data)
  res.end(fn + '(' + data + ')');
}
```

## 2. CORS

上面 jsonp 的方式已经暴露了一个巨大的缺点，那就是无法解决 post 请求的跨域。因此，我们更多的是使用 cors 来解决跨域问题。

**跨源资源共享 (CORS)** （或通俗地译为跨域资源共享）是一种基于 HTTP 头的机制，该机制通过允许服务器标示除了它自己以外的其它 origin（域，协议和端口），这样浏览器可以访问加载这些资源。跨源资源共享还通过一种机制来检查服务器是否会允许要发送的真实请求，该机制通过浏览器发起一个到服务器托管的跨源资源的"预检"请求。在预检中，浏览器发送的头中标示有 HTTP 方法和真实请求中会用到的头。

以 fetch 请求为例， `fetch('http://localhost:10086/cors/test1')`

### scene 1

当我们什么都不做时，此时我们发现，network 弹出如下错误：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210416150327413.png#pic_center)

根据报错提示设置 mode，于是我们设置如下`fetch('http://baidu.com/x',{mode:'no-cors'})`，此时结果如下![在这里插入图片描述](https://img-blog.csdnimg.cn/20210416150717417.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NTMxNjMyNg==,size_16,color_FFFFFF,t_70#pic_center)
network 不再报错了，然而没有返回值，status 居然是 0。
原来 `no-cors`并不是绕过跨域的意思,这也是新手常犯的一个错误

> **no-cors** 保证请求对应的 method 只有 HEAD，GET 或 POST 方法，并且请求的 headers 只能有简单请求头 (simple headers)。如果 ServiceWorker 劫持了此类请求，除了 simple header 之外，不能添加或修改其他 header。另外 JavaScript 不会读取 Response 的任何属性。这样将会确保 ServiceWorker 不会影响 Web 语义(semantics of the Web)，同时保证了在跨域时不会发生安全和隐私泄露的问题。

原来，我们需要在服务端设置头信息`Access-Control-Allow-Origin`，可以带\*，代表 wildcard，任何 origin 都合法，但是有一定的安全风险， 也可以设置具体的 origin，本例子则设置为`http://localhost:4000`。如果想带多个的话呢？抱歉，没有办法，只能设置单独一个，或者全部都成功。

```js
res.header('Access-Control-Allow-Origin', '*');
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210416152455876.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NTMxNjMyNg==,size_16,color_FFFFFF,t_70)

### scene 2

突然，我们接到了一个提交表单的需求，于是服务端增加了一个新的 api 代码如下

```js
app.post('/form', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({ success: true });
});
```

前端代码如下：

```js
const data = new URLSearchParams();
data.append('user', 'zhang san');
//送出request
fetch('http://localhost:10086/form', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: data,
})
  .then(res => res.json())
  .then(res => console.log(res));
```

测试之后，也很顺利，但此时后端告知前端，希望统一以 json 的方式传递数据，而不是 urlencoded 的方式， 于是对前端代码做如下改动：

```js
const data = { name: 'zhang san' };
//送出request
fetch('http://localhost:10086/form', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
})
  .then(res => res.json())
  .then(res => console.log(res));
```

然后，你突然发现，又出现了跨域的现象![在这里插入图片描述](https://img-blog.csdnimg.cn/2021041615544081.png#pic_center)
奇怪，明明只是换了一个格式而已，跟跨域有什么关系呢？ 同时，在 network 处还多出现了一个 options 请求![在这里插入图片描述](https://img-blog.csdnimg.cn/20210416155818156.png)
然后 我们根据报错提示的关键字 `preflight request`查询后发现，原来之前发送的都是**简单请求**。简单请求需要满足下列条件：

1.  method 是 get、post 或 head
2.  只包含简单请求头： Accept,Accept-Language,Content-Language，Content-type 值是 application/x-www-form-urlencoded, multipart/form-data, 或者 text/plain 之一的（忽略参数）
3.  请求中的任意 XMLHttpRequestUpload 对象均没有注册任何事件监听器；XMLHttpRequestUpload 对象可以使用 XMLHttpRequest.upload 属性访问
4.  请求中没有使用 ReadableStream 对象

原来改成`'Content-Type': 'application/json'`后，请求就不再是简单请求了。作为复杂请求，浏览器会多送出一个东西，叫做`preflight request`，中文翻作「**预检请求**」。这个请求就是小明在 network tab 看到的那个 options 的 request。
预请求实际上是对服务端的一种权限请求，只有当预请求成功返回，实际请求才开始执行。此时浏览器会代为增加两个 header

- Access-Control-Request-Headers: 以逗号分隔的列表，当中是复杂请求所使用的头部， 本例为`Access-Control-Request-Headers: content-type`
- Access-Control-Request-Method: 实际请求的类型，可以是 get、post 这种简单请求，也可以是 put、delete 这种

此时作为服务端，也需要返回"预回应"作为响应。

```js
app.post('/form', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({ success: true });
});

// 新增options让preflight通过
app.options('/form', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.end();
});
```

然而，发现还是有问题，此时的错误信息如下
![在这里插入图片描述](https://img-blog.csdnimg.cn/2021041616251537.png)
原来需要在预检中明确指定 header 头才能预检通过

```js
app.options('/form', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  // 如果有多个 以逗号隔开 如'content-type,x-my-token'
  res.header('Access-Control-Allow-Headers', 'content-type');
  res.end();
});
```

经历一番波折后，终于顺利完成了。简单来说，preflight 就是一个验证机制，在请求时需要先通过 preflight 才能发送真正的请求。举例说明：当跨域请求可以正常发起，但是返回的结果被浏览器拦截了，此时服务端已经进行了一系列操作，但因为浏览器的拦截，导致拿不到结果，对前端而已是一次失败的请求。为了防止这种情况的发生，规范要求，对这种可能对服务器数据产生副作用的 HTTP 请求方法，浏览器必须先使用 OPTIONS 方法发起一个预检请求。当然，缺点是，请求数增加，也可以通过设置缓存的方式来减少请求数

```js
res.header('Access-Control-Max-Age', '600');
```

### scene 3

好景不长，我们突然又接到一个新的需求，需要携带 cookie 来做身份认证，于是我们查询 mdn 后知道，只需要添加`credentials: 'include'`后就可以携带 cookie 了

```js
const data = { name: 'zhang san' };
//送出request
fetch('http://localhost:10086/form', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify(data),
})
  .then(res => res.json())
  .then(res => console.log(res));
```

然而，却发现如下错误
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210416170338266.png)
原来，如果要携带 cookie 的话 `Access-Control-Allow-Origin`不能为\*，必须明确指定 origin。如果不做限制，任何网站都能发请求到这个 api，并且携带 cookie，很容易导致安全问题。同时`Access-Control-Allow-Credentials: true`，处于安全性的考虑，后端还要额外带上这个 header。

```js
app.post('/form', (req, res) => {
  // 指定origin
  res.header('Access-Control-Allow-Origin', 'http://localhost:4000');
  // 新增这个
  res.header('Access-Control-Allow-Credentials', true);
  res.json({ success: true });
});

app.options('/form', (req, res) => {
  // 指定origin
  res.header('Access-Control-Allow-Origin', 'http://localhost:4000');
  res.header('Access-Control-Allow-Headers', 'content-type');
  // 新增这个
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Max-Age', 600);
  res.end();
});
```

运行代码后，大功告成
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210416171430177.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NTMxNjMyNg==,size_16,color_FFFFFF,t_70)

### scene 4

突然，我们接到一个下载文件的需求，我们需要通过响应头的`file-text-type`来获取文件的类型，后端代码如下

```js
res.header('file-text-type', '.pdf');
```

在 network 响应头中，我们也顺利发现了 file-text-type
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210416172840506.png)
前端代码：

```js
fetch('http://localhost:10086/form', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify(data),
})
  .then(res => {
    console.log('Content-Type', res.headers.get('Content-Type'));
    console.log('file-text-type', res.headers.get('file-text-type'));
    return res.json();
  })
  .then(res => console.log(res));
```

执行后发现
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210416173219843.png)
奇怪了，明明在 network 发现了 file-text-type，为什么打印出来的是 null 呢？而 Content-Type 为什么不受影响呢？原来，要存取 CORS response 的 header，尤其是这种自定义的 header 的话，后端需要多带`Access-Control-Expose-Headers`这个 header

```js
app.post('/form', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4000');
  res.header('Access-Control-Allow-Credentials', true);
  // 新增 可逗号分割传多个
  res.header('Access-Control-Expose-Headers', 'file-text-type');
  res.header('file-text-type', '.pdf');
  res.json({ success: true });
});
```

大功告成！当我们需要跨来源获取响应头中的内容时，需要让后端携带`Access-Control-Expose-Headers`，告知浏览器，否则取到的内容为 null

### scene 5

风和日丽的一天，突然我们接到一个需要，后端需要把之前做的 post 请求修改为 put 请求，so easy！然后就遇到了下面的情况
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210416174611739.png)
原来，如果前端要使用 GET、HEAD 以及 POST 以外的 HTTP method 发送请求的话，后端的 preflight response header 必须有`Access-Control-Allow-Methods`并且指定合法的 method，preflight 才会通过，浏览器才会把真正的 request 发送出去

```js
app.options('/form', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4000');
  res.header('Access-Control-Allow-Headers', 'content-type');
  // 指定方法，区分大小写
  res.header('Access-Control-Allow-Methods', 'PUT');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Max-Age', 1);
  res.end();
});
```

# 总结

本文主要讲解了 jsonp 和 cors 两种跨域方式，尤其是 cors 方式中不同 header 头的作用。当然，具体跨域使用哪种方式还是需要参考具体的业务需求。
