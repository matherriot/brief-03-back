const { v4: uuid, parse } = require('uuid');

class Thread {
  constructor(title, subTitle, base64Banner, desc, price, userId, id) {
    if (!id || parse(id)) {
      this.id = uuid(undefined, undefined, undefined);
    } else {
      this.id = id;
    }

    this.title = title;
    this.subTitle = subTitle;
    this.base64Banner = base64Banner;
    this.desc = desc;
    this.price = price;
    this.userId = userId;
  }
}
module.exports = Thread;