const fs = require('fs');
const path = require('path');
const protocolsPath = path.resolve(__dirname + '/protocols');

const protocols = fs.readdirSync(protocolsPath).map(fileOrDirectory => {
  const ext = fileOrDirectory.split('.').pop();
  const fileAbsPath = `${protocolsPath}${path.sep}${fileOrDirectory}`;

  if (ext === 'js' && fs.lstatSync(fileAbsPath).isFile()) {
    return require(fileAbsPath);
  }

}).filter(protocol => protocol != null);


// exports.getProtocolById = (id) => {
//   protocols.find(protocol => id === protocol.id);
// };

module.exports = protocols;



