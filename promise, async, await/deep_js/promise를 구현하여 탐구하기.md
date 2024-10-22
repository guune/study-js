promise를 구현해서 알아보자

https://exploringjs.com/deep-js/ch_implementing-promises.html#version-5-revealing-constructor-pattern

### Promise의 상태

- promise는 처음에는 pending
- 값 v로 reolve되면 fulfilled 값은 v
- 에러 e로 reject 되면 rejected 에러값은 e

### 버전 1: 독립형 Promise

- promise를 만들 수 있음
- promise를 resolve, reject 할 수 있으며 이를 한 번만 수행
- .을 통해 callback을 등록할 수 있다
- .then() 체이닝은 아직 지원 안 한다.

- ToyPromise는 3개의 프로토타입 메서드가 있는 클래스
  - `ToyPromise1.prototype.resolve(value)`
  - `ToyPromise1.prototype.reject(reason)`
  - `ToyPromise1.prototype.then(onFulfilled, onRejected)`

실행 예시

```js
// .resolve() before .then()
const tp1 = new ToyPromise1();
tp1.resolve("abc");
tp1.then((value) => {
  assert.equal(value, "abc");
});

// .then() before .resolve()
const tp2 = new ToyPromise1();
tp2.then((value) => {
  assert.equal(value, "def");
});
tp2.resolve("def");
```

#### then 메서드

then은 두 가지 경우를 처리해야 한다

1. Promise가 아직 pending이면 onFulfilled와 onRejected 호출들이 대기열에 추가됩니다. 이들은 Promise가 처리(settled)될 때 나중에 사용됨
2. 이미 이행되거나 거부된 경우 , onFulfilled 또는 onRejected는 즉시 호출될 수 있음

```js
then(onFulfilled, onRejected) {
  const fulfillmentTask = () => {
    if (typeof onFulfilled === 'function') {
      onFulfilled(this._promiseResult);
    }
  };
  const rejectionTask = () => {
    if (typeof onRejected === 'function') {
      onRejected(this._promiseResult);
    }
  };
  switch (this._promiseState) {
    case 'pending':
      this._fulfillmentTasks.push(fulfillmentTask);
      this._rejectionTasks.push(rejectionTask);
      break;
    case 'fulfilled':
      addToTaskQueue(fulfillmentTask);
      break;
    case 'rejected':
      addToTaskQueue(rejectionTask);
      break;
    default:
      throw new Error();
  }
}

function addToTaskQueue(task) {
  setTimeout(task, 0);
}
```

promise는 항상 비동기로 처리되어야 하므로 addToTaskQueue라는 헬퍼함수를 사용

#### resolve 메서드

Promise가 이미 처리된 상태라면, 아무 것도 하지 않는다(Promise가 단 한번만 처리될 수 있도록 보장)
그렇지 않은 경우 Promise의 상태가 fufilled가 변경 되며 결과가 this.promiseResult에 저장 된다. 그 다음, 지금까지 대기열에 추가된 모든 이행 반응이 호출 된다

```js
resolve(value) {
  if (this._promiseState !== 'pending') return this;
  this._promiseState = 'fulfilled';
  this._promiseResult = value;
  this._clearAndEnqueueTasks(this._fulfillmentTasks);
  return this; // 체이닝을 가능하게 함
}

_clearAndEnqueueTasks(tasks) {
  this._fulfillmentTasks = undefined;
  this._rejectionTasks = undefined;
  tasks.map(addToTaskQueue);
}
```

reject는 비슷

#### 버전 1 코드

```js
export class ToyPromise1 {
  _fulfillmentTasks = [];
  _rejectionTasks = [];
  _promiseResult = undefined;
  _promiseState = "pending";

  then(onFulfilled, onRejected) {
    const fulfillmentTask = () => {
      if (typeof onFulfilled === "function") {
        onFulfilled(this._promiseResult);
      }
    };
    const rejectionTask = () => {
      if (typeof onRejected === "function") {
        onRejected(this._promiseResult);
      }
    };
    switch (this._promiseState) {
      case "pending":
        this._fulfillmentTasks.push(fulfillmentTask);
        this._rejectionTasks.push(rejectionTask);
        break;
      case "fulfilled":
        addToTaskQueue(fulfillmentTask);
        break;
      case "rejected":
        addToTaskQueue(rejectionTask);
        break;
      default:
        throw new Error();
    }
  }

  resolve(value) {
    if (this._promiseState !== "pending") return this;
    this._promiseState = "fulfilled";
    this._promiseResult = value;
    this._clearAndEnqueueTasks(this._fulfillmentTasks);
    return this; // enable chaining
  }

  reject(error) {
    if (this._promiseState !== "pending") return this;
    this._promiseState = "rejected";
    this._promiseResult = error;
    this._clearAndEnqueueTasks(this._rejectionTasks);
    return this; // enable chaining
  }

  _clearAndEnqueueTasks(tasks) {
    this._fulfillmentTasks = undefined;
    this._rejectionTasks = undefined;
    tasks.map(addToTaskQueue);
  }
}

function addToTaskQueue(task) {
  setTimeout(task, 0);
}
```
