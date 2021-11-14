var mPackage = require('./package.json');

var fs = require('fs');

function incVersion(v) {
    let s = v.split('.')
    let p = s.length - 1;
    s[p] = (parseInt(s[p]) + 1).toString();
    return s.join('.');
}

mPackage.version = incVersion(mPackage.version);

fs.writeFileSync('package.json', JSON.stringify(mPackage, null, '  '));