const webpack = require('webpack');
module.exports = {
  entry: {
    js:"./src/main.js"
  },
  output:{
    path:"./dist",
    filename:"garoonSoapConnector.min.js"
  }
}
