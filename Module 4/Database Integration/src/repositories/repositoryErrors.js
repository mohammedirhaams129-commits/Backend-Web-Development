function translateDatabaseError(error) {
  if (error && error.code === 'P2002') {
    const safe = new Error('A record with these details already exists');
    safe.statusCode = 409;
    return safe;
  }
  if (error && error.code === 'P2003') {
    const safe = new Error('The request references a record that does not exist');
    safe.statusCode = 409;
    return safe;
  }
  if (error && error.code === 'P2025') {
    const safe = new Error('The requested record was not found');
    safe.statusCode = 404;
    return safe;
  }
  return new Error('Database operation failed');
}

module.exports = { translateDatabaseError };
