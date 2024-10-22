### 프라미스

인기 있는 가수 있다고 가정해보자
앨범을 제작하는 동안 팬들이 언제 완성돼요?라고 계속 물어볼 수 있다
가수가 제작이 완료되면 자동으로 팬들에게 알려주는 형식이면 이런 부하를 줄일 수 있다

위의 예시를 나눠보면

1. 제작 코드: 원격에서 스크립트를 불러오는 것 같은 시간이 걸리는 일
2. 소비 코드: 제작 코드의 결과를 기다렸다가 이를 소비함 소비 주체는 여럿이 될 수 있음
3. 프라미스: 제작 코드와 소비 코드를 연결해 주는 특별한 js 객체

물론 프라미스는 더 복잡하지만 이 비유를 통해 학습해보자

```js
let promise = new Promise(function (resolve, reject) {
  // executor (제작 코드, '가수')
});
```

new Promise에 전달되는 함수는 executor(실행자, 실행 함수)라고 부른다
executor는 new Promise가 만들어 질 때 자동으로 실행 된다.

인수 resolve, reject는 자바스크립트에서 자체 제공하는 콜백, 이것을 신경쓰지 말고 executor를 작성하면 된다
단, 상황에 따라 인수로 넘겨준 콜백 중 하나를 반드시 호출해야 함

- `resolve(value)` — 일이 성공적으로 끝난 경우 그 결과를 나타내는 `value`와 함께 호출
- `reject(error)` — 에러 발생 시 에러 객체를 나타내는 `error`와 함께 호출

한편, new Promise 생성자가 반환하는 promise 객체는 다음과 같은 내부 프로퍼티를 갖음

- `state` — 처음엔 `"pending"`(보류)이었다 `resolve`가 호출되면 `"fulfilled"`, `reject`가 호출되면 `"rejected"`로 변합니다.
- `result` — 처음엔 `undefined`이었다 `resolve(value)`가 호출되면 `value`로, `reject(error)`가 호출되면 `error`로 변합니다.

![promise 내부 상태.png](./images/promise%20내부%20상태.png)

간단하게 executor 함수를 만들어 보자

```js
let promise = new Promise(function (resolve, reject) {
  // 프라미스가 만들어지면 executor 함수는 자동으로 실행됩니다.

  // 1초 뒤에 일이 성공적으로 끝났다는 신호가 전달되면서 result는 '완료'가 됩니다.
  setTimeout(() => resolve("완료"), 1000);
});
```

위의 예시를 통해서 우리가 알 수 있는 것은 두 가지

1. executor는 `new Promise`에 의해 자동으로 그리고 즉각적으로 호출됩니다.

2. executor는 인자로 `resolve`와 `reject` 함수를 받습니다. 이 함수들은 자바스크립트 엔진이 미리 정의한 함수이므로 개발자가 따로 만들 필요가 없습니다. 다만, `resolve`나 `reject` 중 하나는 반드시 호출해야 합니다.
   executor '처리’가 시작 된 지 1초 후, `resolve("완료")`이 호출되고 결과가 만들어집니다. 이때 `promise` 객체의 상태는 다음과 같이 변합니다.

![promise 내부 변화.png](./images/promise%20내부%20변화.png)

에러가 생기는 경우는?

```js
let promise = new Promise(function (resolve, reject) {
  // 1초 뒤에 에러와 함께 실행이 종료되었다는 신호를 보냅니다.
  setTimeout(() => reject(new Error("에러 발생!")), 1000);
});
```

![promise 에러의 경우 내부 상태.png](./images/promise%20에러의%20경우%20내부%20상태.png)

> [!NOTE]
> **프라미스는 성공 또는 실패만 한다**   
> 처리가 끝난 프라미스에 resolve와 reject를 호출하면 무시됨

> [!NOTE]
> **Error 객체와 함께 거부하기**  
> reject시 어떤 타입도 가능하지만 Error 객체 또는 Error를 상속받은 객체를 사용할 것을 추천

> [!NOTE]   
> **resolve, reject 함수 즉시 호출하기**  
> 즉시 호출 가능
>
> ```js
> let promise = new Promise(function (resolve, reject) {
>   // 일을 끝마치는 데 시간이 들지 않음
>   resolve(123); // 결과(123)를 즉시 resolve에 전달함
> });
> ```

> [!NOTE]
> **state와 result는 내부에 있음**  
> 개발자가 직접 접근 불가능
> .then/.catch/.fianlly 메서드를 사용하면 가능

나만의 언어로 정리:

> 시간이 걸리는 일이 있고 그것을 기다리는 행동이 있다고 해보자
> 이때 시간이 걸리는 일을 제작코드, 기다리는 행동을 소비 코드라고 할 수 있다
> 제작 코드와 소비코드를 연결 해주는 것이 promise라는 객체이다

> 객체이므로 let promise = new Promise(function(resolve, reject)) {} 이런식으로 만든다
> resolve, reject는 js가 제공하는 콜백으로 둘 중 하나를 제작 코드가 완료되면 호출하면 됨
> 또한 객체 안에는 state, result라는 상태가 있고 생성될때는 각각 pending, undefined로 되어 있고
> resolve 되면 fulfilled, value, reject 되면 rejected, error가 각각 된다

> 이것을 한 번 비유 해보자 비유는 올바르지 않더라도 뇌의 뉴런 연결, 아웃풋 연습에 좋다
> 지금까지 콜백 함수는 하나의 골목 식당이였다
> 주문도 별로 없고 단순히 주문을 받고 음식을 하고 주문이 다 되면 떡볶이 다 됐어요 하면 손님이 가져다 먹는 식이였다 이래도 잘 운영이 됐다
>
> 하지만 장사가 잘 되고 식당도 확장을 하니 이런 주먹구구식은 통하지 않는다
> 할 일이 많아지다 보니 키오스크와 주문벨을 도입했다
> 키오스크의 경우 손님이 주문을 완료하면 그거에 맞는 주문벨을 제공한다(promise 객체)
> 주문벨에는 상태: 준비중 결과: 알 수 없음 처음에 찍혀있다
> 식당 주인은 음식이 완료가 되면 손님의 주문벨에 상태: 완료 결과: 음식을 띄워서 손님이 가져다 먹게 한다
> 음식이 가끔 실패하는데(?) 이럴때는 손님의 주문벨에 상태: 거부 결과: 에러가 뜬다

### 소비자: then, catch, finally

#### then

```js
promise.then(
  function (result) {
    /* 결과(result)를 다룹니다 */
  },
  function (error) {
    /* 에러(error)를 다룹니다 */
  }
);
```

인수 두 개를 받을 수 있음

```js
let promise = new Promise(function (resolve, reject) {
  setTimeout(() => reject(new Error("에러 발생!")), 1000);
});

// reject 함수는 .then의 두 번째 함수를 실행합니다.
promise.then(
  (result) => alert(result), // 실행되지 않음
  (error) => alert(error) // 1초 후 "Error: 에러 발생!"을 출력
);
```

성공적으로 처리된 경우만 다루고 싶다면

```js
let promise = new Promise((resolve) => {
  setTimeout(() => resolve("완료!"), 1000);
});

promise.then(alert); // 1초 뒤 "완료!" 출력
```

#### catch

에러가 발생한 경우만 다루고 싶으면 `.then(null, errorHandlingFunction)` 또는 `.catch(errorHandlingFunction)`를 사용해도 된다

```js
let promise = new Promise((resolve, reject) => {
  setTimeout(() => reject(new Error("에러 발생!")), 1000);
});

// .catch(f)는 promise.then(null, f)과 동일하게 작동합니다
promise.catch(alert); // 1초 뒤 "Error: 에러 발생!" 출력
```

.catch(f)는 문법이 간결하다는 점만 빼고 .then(null,f)과 완벽하게 같습니다.

#### finally

try, catch와 동일하게 프라미스도 finally가 있다
프라미스가 처리되면(이행이나 거부) `f`가 항상 실행된다는 점에서 `.finally(f)` 호출은 `.then(f, f)`과 유사합니다.

```js
new Promise((resolve, reject) => {
  /* 시간이 걸리는 어떤 일을 수행하고, 그 후 resolve, reject를 호출함 */
})
  // 성공·실패 여부와 상관없이 프라미스가 처리되면 실행됨
  .finally(() => 로딩 인디케이터 중지)
  .then(result => result와 err 보여줌 => error 보여줌)
```

그런데 `finally`는 `.then(f, f)`과 완전히 같진 않습니다. 차이점은 다음과 같습니다.

1. `finally` 핸들러엔 인수가 없다 finally는 이행되었는지 거부되었는지 알 수 없다 `finally`에선 절차를 마무리하는 ‘보편적’ 동작을 수행하기 때문에 성공·실패 여부를 몰라도 됩니다.
2. `finally` 핸들러는 자동으로 다음 핸들러에 결과와 에러를 전달합니다.
3. `.finally(f)`는 함수 `f`를 중복해서 쓸 필요가 없기 때문에 `.then(f, f)`보다 문법 측면에서 더 편리합니다.

> [!caution]
> **처리된 프라미스의 핸들러는 즉각 실행 됩니다**
>
> ```js
> // 아래 프라미스는 생성과 동시에 이행됩니다.
> let promise = new Promise((resolve) => resolve("완료!"));
> promise.then(alert); // 완료! (바로 출력됨)
> ```
>
> 이게 위의 가수 팬 보다 프라미스가 더 복잡하다고 한 이유  
> 구독을 하고 있어야지 신곡 여부를 파악할 수 있다 promise의 경우 구독을 안하고 신곡이 발표된후 then을 사용해도 결과를 받을 수 있다

### 예시: loadScript

기존 콜백

```js
function loadScript(src, callback) {
  let script = document.createElement("script");
  script.src = src;

  script.onload = () => callback(null, script);
  script.onerror = () => callback(new Error(`${src}를 불러오는 도중에 에러가 발생함`));

  document.head.append(script);
}
```

```js
function loadScript(src) {
  return new Promise(function (resolve, reject) {
    let script = document.createElement("script");
    script.src = src;

    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`${src}를 불러오는 도중에 에러가 발생함`));

    document.head.append(script);
  });
}
```

```js
let promise = loadScript("https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.11/lodash.js");

promise.then(
  (script) => alert(`${script.src}을 불러왔습니다!`),
  (error) => alert(`Error: ${error.message}`)
);

promise.then((script) => alert("또다른 핸들러..."));
```

| 프라미스                                                                                                                                                                                                                                            | 콜백                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 프라미스를 이용하면 흐름이 자연스럽습니다. `loadScript(script)`로 스크립트를 읽고, 결과에 따라 그다음(`.then`)에 무엇을 할지에 대한 코드를 작성하면 됩니다.                                                                                         | `loadScript(script, callback)`를 호출할 때, 함께 호출할 `callback` 함수가 준비되어 있어야 합니다. `loadScript`를 호출하기 *이전*에 호출 결과로 무엇을 할지 미리 알고 있어야 합니다. |
| 프라미스에 원하는 만큼 `.then`을 호출할 수 있습니다. `.then`을 호출하는 것은 새로운 ‘팬’(새로운 구독 함수)을 '구독 리스트’에 추가하는 것과 같습니다. 자세한 내용은 [프라미스 체이닝](https://ko.javascript.info/promise-chaining)에서 다루겠습니다. | 콜백은 하나만 가능합니다.                                                                                                                                                           |

### 과제

#### 두 번 resolve 하기?

아래 코드의 실행 결과를 예측해보세요.

```js
let promise = new Promise(function (resolve, reject) {
  resolve(1);

  setTimeout(() => resolve(2), 1000);
});

promise.then(alert);
```

해답: 당연히 1

#### 프라미스로 지연 만들기

내장 함수 setTimeout은 콜백을 사용합니다. 프라미스를 기반으로 하는 동일 기능 함수를 만들어보세요.

함수 delay(ms)는 프라미스를 반환해야 합니다. 반환되는 프라미스는 아래와 같이 .then을 붙일 수 있도록 ms 이후에 이행되어야 합니다.

```js
function delay(ms) {
  // 여기에 코드 작성
}

delay(3000).then(() => alert("3초후 실행"));
```

나의 답:

```js
function delay(ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, ms);
  });
}
```

화살표 함수로 줄이기

```js
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```
