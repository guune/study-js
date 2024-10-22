5가지 정적 메서드가 있다
### Promise.all

```js
let promise = Promise.all([...promises...]);
```
Promise.all은 요소 전체가 프라미스인 배열((엄밀히 따지면 이터러블 객체이지만, 대개는 배열)을 받고 새로운 프라미스를 반환

배열 안 프라미스가 모두 처리되면 새로운 프라미스가 이행, 배열 안 프라미스의 결괏값을 담은 배열이 새로운 프라미스의 result가 된다

```js
Promise.all([
  new Promise(resolve => setTimeout(() => resolve(1), 3000)), // 1
  new Promise(resolve => setTimeout(() => resolve(2), 2000)), // 2
  new Promise(resolve => setTimeout(() => resolve(3), 1000))  // 3
]).then(alert);
 // 프라미스 전체가 처리되면 1, 2, 3이 반환됩니다. 각 프라미스는 배열을 구성하는 요소가 됩니다.
```
위의 예시에서 첫 번째 프라미스가 가장 늦게 처리 됐는데(3초 걸림) 처리 결과는 배열의 첫 번째 요소에 저장 됨

작업해야 할 데이터가 담긴 배열을 프라미스 배열로 매핑하고, 이 배열을 `Promisa.all`로 감싸는 트릭을 자주 사용 된다

URL이 담긴 배열을 `fetch`를 써서 처리하는 예시
```js
let urls = [
  'https://api.github.com/users/iliakan',
  'https://api.github.com/users/Violet-Bora-Lee',
  'https://api.github.com/users/jeresig'
];

// fetch를 사용해 url을 프라미스로 매핑합니다.
let requests = urls.map(url => fetch(url));

// Promise.all은 모든 작업이 이행될 때까지 기다립니다.
Promise.all(requests)
  .then(responses => responses.forEach(
    response => alert(`${response.url}: ${response.status}`)
  ));
```

Git 유저 네임이 담긴 배열을 사용해 사용자 정보를 가져오는 예시(실무에서 id를 기준으로 장바구니 목록을 불러 올 때도 같은 로직을 사용할 수 있음)
```js
let names = ['iliakan', 'Violet-Bora-Lee', 'jeresig'];

let requests = names.map(name => fetch(`https://api.github.com/users/${name}`));

Promise.all(requests)
  .then(responses => {
    // 모든 응답이 성공적으로 이행되었습니다.
    for(let response of responses) {
      alert(`${response.url}: ${response.status}`); // 모든 url의 응답코드가 200입니다.
    }

    return responses;
  })
  // 응답 메시지가 담긴 배열을 response.json()로 매핑해, 내용을 읽습니다.
  .then(responses => Promise.all(responses.map(r => r.json())))
  // JSON 형태의 응답 메시지는 파싱 되어 배열 'users'에 저장됩니다.
  .then(users => users.forEach(user => alert(user.name)));
```

**단, `Promise.all`에 전달되는 프라미스 중 하나라도 거부되면, 에러와 함께 바로 거부 됨**
```js
Promise.all([
  new Promise((resolve, reject) => setTimeout(() => resolve(1), 1000)),
  new Promise((resolve, reject) => setTimeout(() => reject(new Error("에러 발생!")), 2000)),
  new Promise((resolve, reject) => setTimeout(() => resolve(3), 3000))
]).catch(alert); // Error: 에러 발생!
```
`.catch`가 실행 된다\

> [!CAUTION]
> **에러가 발생하면 다른 프라미스는 무시 된다**<br>
> `fetch`를 사용해 호출 여러 개를 만들면, 그중 하나가 실패하더라도 호출은 계속 일어난다. 그렇다라도 `Promise.all`은 다른 호출을 더는 신경 쓰지 않는다. 즉 처리가 되더라도 그 결과는 무시 된다
> 프라미스에서는 '취소'라는 개념이 없어서 `Promise.all`도 프라미스를 취소하지 않는다. 다른 챕에서 배울 `AbortController`를 사용하면 프라미스 취소가 가능하긴 하지만, `AbortController`는 프라미스 API는 아니다


>[!NOTE]
> **이터러블 객체가 아닌 일반 값도 Promisa.all에 넘길 수 있다**<br>
>```js
>Promise.all([
>new Promise((resolve, reject) => {
>	setTimeout(() => resolve(1), 1000)
>}),
>2,
>3
>]).then(alert); // 1, 2, 3
>```

### Promise.allSettled
`Promise.all`은 프라미스가 하나라도 거절되면 전체를 거절. 따라서, 프라미스 결과가 모두 필요할 때같이 '모 아니면 도'일 때 유용

```js
Promise.all([
  fetch('/template.html'),
  fetch('/style.css'),
  fetch('/data.json')
]).then(render); // render 메서드는 fetch 결과 전부가 있어야 제대로 동작합니다.
```

반면, `Promise.allSettled`는 모든 프라미스가 처리될 때까지 기다린다
반환되는 배열은 다음과 같은 요소를 갖는다.
- 응답이 성공할 경우 – `{status:"fulfilled", value:result}`
- 에러가 발생한 경우 – `{status:"rejected", reason:error}`

`fetch`를 사용해 여러 사람의 정보를 가져오고 있다고 해보자. 여러 요청 중 하나가 실패해도 다른 요청 결과는 여전히 필요

```js
let urls = [
  'https://api.github.com/users/iliakan',
  'https://api.github.com/users/Violet-Bora-Lee',
  'https://no-such-url'
];

Promise.allSettled(urls.map(url => fetch(url)))
  .then(results => { // (*)
    results.forEach((result, num) => {
      if (result.status == "fulfilled") {
        alert(`${urls[num]}: ${result.value.status}`);
      }
      if (result.status == "rejected") {
        alert(`${urls[num]}: ${result.reason}`);
      }
    });
  });
```
`(*)`로 표시한 줄의 `results`는 다음과 같다

```
[
  {status: 'fulfilled', value: ...응답...},
  {status: 'fulfilled', value: ...응답...},
  {status: 'rejected', reason: ...에러 객체...}
]
```
Promise.allSettled를 사용하면 이처럼 각 프라미스의 상태와 `값 또는 에러`를 받을 수 있다

#### 폴리필
브라우저가 지원하지 않는 다면
```js
if(!Promise.allSettled) {
  Promise.allSettled = function(promises) {
    return Promise.all(promises.map(p => Promise.resolve(p).then(value => ({
      status: 'fulfilled',
      value
    }), reason => ({
      status: 'rejected',
      reason
    }))));
  };
}
```
여기서 `promises.map`은 입력값을 받아 `p => Promise.resolve(p)`로 입력값을 프라미스로 변화시킵니다(프라미스가 아닌 값을 받은 경우). 그리고 모든 프라미스에 `.then` 핸들러가 추가된다

`then` 핸들러는 성공한 프라미스의 결괏값 `value`를 `{status:'fulfilled', value}`로, 실패한 프라미스의 결괏값 `reason`을 `{status:'rejected', reason}`으로 변경. `Promise.allSettled`의 구성과 동일하게.

### Promise.race
`Promise.race`는 `Promise.all`과 비슷합니다. 다만 가장 먼저 처리되는 프라미스의 결과(혹은 에러)를 반환

```js
Promise.race([
  new Promise((resolve, reject) => setTimeout(() => resolve(1), 1000)),
  new Promise((resolve, reject) => setTimeout(() => reject(new Error("에러 발생!")), 2000)),
  new Promise((resolve, reject) => setTimeout(() => resolve(3), 3000))
]).then(alert); // 1
```
위의 결과는 1

### Promise.resolve, Promise.reject
`async/await` 문법이 생긴 후로 쓸모가 없어져서 근래에는 거의 사용하지 않는다
#### Promise.resolve
`Promise.resolve(value)`는 결괏값이 `value`인 이행 상태 프라미스를 생성
```js
let promise = new Promise(resolve => resolve(value));
```

예시
```js
let cache = new Map();

function loadCached(url) {
  if (cache.has(url)) {
    return Promise.resolve(cache.get(url)); // (*)
  }

  return fetch(url)
    .then(response => response.text())
    .then(text => {
      cache.set(url,text);
      return text;
    });****
}
```
loadCached를 호출하면 프라미스가 반환된다는 것이 보자오디기 때문에 `loadCached(url).then(…)`을 사용할 수 있음. `loadCached` 뒤에 언제나 `.then`을 쓸 수 있게 된다. `(*)`로 표시한 줄에서 `Promise.resolve`를 사용한 이유가 바로 여기에 있음.

#### Promise.reject
```js
let promise = new Promise((resolve, reject) => reject(error));
```

실무에서 이 메서드를 쓸 일은 거의 없다

### 요약
`Promise` 클래스에는 5가지 정적 메서드가 있습니다.

1. `Promise.all(promises)` – 모든 프라미스가 이행될 때까지 기다렸다가 그 결괏값을 담은 배열을 반환합니다. 주어진 프라미스 중 하나라도 실패하면 `Promise.all`는 거부되고, 나머지 프라미스의 결과는 무시됩니다.
2. `Promise.allSettled(promises)` – 최근에 추가된 메서드로 모든 프라미스가 처리될 때까지 기다렸다가 그 결과(객체)를 담은 배열을 반환합니다. 객체엔 다음과 같은 정보가 담깁니다.
    - `status`: `"fulfilled"` 또는 `"rejected"`
    - `value`(프라미스가 성공한 경우) 또는 `reason`(프라미스가 실패한 경우)
3. `Promise.race(promises)` – 가장 먼저 처리된 프라미스의 결과 또는 에러를 담은 프라미스를 반환합니다.
4. `Promise.resolve(value)` – 주어진 값을 사용해 이행 상태의 프라미스를 만듭니다.
5. `Promise.reject(error)` – 주어진 에러를 사용해 거부 상태의 프라미스를 만듭니다.

실무에선 다섯 메서드 중 `Promise.all`을 가장 많이 사용합니다.

나만의 언어로 정리 및 비유:
>promise 메서드가 all, allSettled, race, resolve, reject가 있음<br>
>promise를 전에 주문벨로 비유 한 적이 있음<br>
> 주문벨을 받으면 손님에게는 state: 조리 중(pending) result: 모름(undefined)이 뜬다<br>
>이때 이  주문벨을 가지고 여러가지 일을 할 수 있다<br>
>all<br>
>어떤 사람은 코스 요리가 전부 완료되면 먹고 싶을 수가 있음<br>
>코스 요리 주문벨이 3개 있다고 가정해보자(에피 타이저, 메인 디시, 디저트)<br>
>종업원에세 주문벨 3개를 넘겨주고 다 완료되면 음식을 가져달라고 한다<br>
>하지만 하나라도 음식이 준비가 안 되면 바로 안 된다고 알려주고 안 먹음...<br>
>allSettled<br>
>하나라도 주문이 안 되었다고 안 먹는것은 조금 그래서 일단 가져달라고 함<br>
>race<br>
>배고프니 일단 제일 빨리 되는 것으로 달라고 함<br>
>resolve<br>
>준비가 필요가 없고 즉석으로 결과를 받을 수 있음<br>
>이미 준비된 음식 바로 서빙<br>
>reject<br>
>즉시 주문 거절<br>
