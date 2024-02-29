class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.conditions = [];
    this.values = [];
  }

  addCondition(column, value) {
    this.conditions.push(`${column} ILIKE $${this.values.length + 1}`);
    this.values.push(`%${value}%`);
    return this;
  }

  buildSelect(columns = '*') {
    const whereClause = this.conditions.length ? `WHERE ${this.conditions.join(' AND ')}` : '';
    return `SELECT ${columns} FROM ${this.table} ${whereClause}`;
  }

  getValues() {
    return this.values;
  }
}

module.exports = QueryBuilder;
