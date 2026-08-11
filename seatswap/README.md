# 换座位网站 · 部署说明

这份代码已经写完了核心功能,但需要你做几步"接线"工作才能真正跑起来 —— 这些步骤需要你自己的 Supabase 和 Netlify 账号,我没法替你操作。跟着下面的顺序做就行。

## 第一步:建 Supabase 项目(如果还没有专门给这个项目建过)

1. 去 supabase.com,新建一个项目(免费额度够用)
2. 项目建好后,进入左侧菜单 **SQL Editor**
3. 打开这份代码里的 `supabase/schema.sql` 文件,把**全部内容**复制粘贴进 SQL Editor,点 **Run** 执行一次
   - 这会自动建好数据库表、权限规则(RLS)、票据截图的存储桶
4. 进入左侧菜单 **Settings → API**,记下两个值:
   - **Project URL**(形如 `https://abcdefgh.supabase.co`)
   - **anon public** key(一长串字符,不是 `service_role` 那个)
   - 另外还要记下 **service_role** key(这个绝对不能放到网页代码里,只会用在 Netlify 后台的环境变量)

## 第二步:填入你的 Supabase 信息

打开 `public/js/supabase-config.js`,把里面两行改成你自己的:

```js
window.SUPABASE_URL = 'https://你的项目.supabase.co';
window.SUPABASE_ANON_KEY = '你的-anon-public-key';
```

## 第三步:部署到 Netlify

1. 把整个项目上传到 GitHub(或者直接把 `seatswap` 文件夹拖进 Netlify 部署页面)
2. 在 Netlify 后台,新建站点,关联这个仓库
   - **Publish directory** 填 `public`
   - **Functions directory** 填 `netlify/functions`(netlify.toml 里已经写好了,一般会自动识别)
3. 进入 Netlify 后台 **Site settings → Environment variables**,添加以下三个环境变量(这些是给服务器端代码用的,不会暴露给浏览器):
   - `SUPABASE_URL` = 你的 Supabase Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = 你的 Supabase service_role key
   - `INTERNAL_PASSWORD` = 你想给博文家专属入口设置的口令,比如 `bwj0813`
4. 触发一次部署(Deploy site)

## 第四步:测试

- 打开首页,应该能看到两个入口卡片
- 点"我要登记自己的换座信息",试着填一条,提交后应该会给你一个专属管理链接
- 用那个链接打开 `edit.html`,应该能看到刚才提交的信息
- 点"对外查询"入口,应该能搜到刚才提交的那条(前提是当前座位选的是"非主攻区")
- 点"博文家专属入口",输入你设置的 `INTERNAL_PASSWORD`,应该能看到全部数据

## 两个入口怎么用

- **入口一(博文家专属,需要口令)**:首页点"博文家专属入口"浏览全部数据;点"登记我的非主攻换座信息"(`register.html?entry=1`)登记自己的换座需求 —— 这个登记页面也需要先输入口令才能填,而且分类被锁死成"非主攻区",填不了别的。
- **入口二(任何人都能用,不需要口令)**:首页点"对外查询"只能看到博文家自己人登记的非主攻区数据;点"登记…票信息"(`register.html?entry=2`)可以让别家人自己填、或者你们志愿者代填"当前在主攻/强攻、想换到非主攻"的信息 —— 这部分写进去的数据,只有入口一(有口令)能看到,入口二自己看不到,这样就不怕被别的粉丝群体看到抢跑联系。

## 关于批量导入(Excel)

`netlify/functions/volunteer-import.js` 这个接口还留着口令验证,是给"一次性批量导入一整份Excel"这种场景用的额外保护(防止有人写脚本疯狂刷单条提交接口)。日常一条一条通过入口二网页登记,不需要口令,直接就能提交。


- Excel 表格自动导入解析(现在志愿者数据只能通过 `netlify/functions/volunteer-import.js` 这个接口传,还没有一个页面界面来上传Excel并自动识别)
- 实时更新(Supabase Realtime),现在候选人列表需要手动点"搜索"刷新
- 网页推送通知
- 票价对照表如果以后场馆信息变了,改 `public/js/zones-data.js` 这一个文件就行,所有页面共用

## 如果口令想更换

不需要重新部署代码,直接去 Netlify 后台改 `INTERNAL_PASSWORD` 这个环境变量的值,改完重新触发一次部署(Trigger deploy)就生效了。
