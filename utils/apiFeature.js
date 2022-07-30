class ApiFeature {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    let queryData = { ...this.queryStr };

    const excludeFields = ['page', 'limit', 'sort', 'fields'];
    excludeFields.forEach((match) => delete queryData[match]);

    //replace correct mongodb operators
    queryData = JSON.parse(
      JSON.stringify(queryData).replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
    );

    this.query = this.query.find(queryData);

    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate() {
    const limitVal = this.queryStr.limit * 1 || 5;
    const page = this.queryStr.page * 1 || 1;
    const skipVal = (page - 1) * limitVal;

    this.query = this.query.skip(skipVal).limit(limitVal);

    return this;
  }

  fields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }
}

module.exports = ApiFeature;
