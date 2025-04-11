/* eslint-disable require-jsdoc */
class FakeItems {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.items = [];
  }

  push(item) {
    this.items.push(item);
    return item;
  }

  getQty() {
    return this.items.length;
  }

  getRandom() {
    return this.items[Math.floor(Math.random() * this.items.length)];
  }

  generate(qty, callback) {
    for (let i = 0; i < qty; i++) {
      this.push(callback(i));
    }
  }
}

export default FakeItems;
