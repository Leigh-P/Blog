module.exports = {
    port: 3000,
    session:{
        secret: 'simpleBlog',
        key: 'simpleBlog',
        maxAge: 6000000
    },
    mongodb:'mongodb://localhost/simpleBlog'
}