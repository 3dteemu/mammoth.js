var base64js = require("base64-js");
var JSZip = require("jszip");

exports.openArrayBuffer = openArrayBuffer;
exports.splitPath = splitPath;
exports.joinPath = joinPath;

function openArrayBuffer(arrayBuffer) {
    return JSZip.loadAsync(arrayBuffer).then(function(zipFile) {
        function exists(name) {
            console.log("exists", name);
            return zipFile.file(name) !== null;
        }

        function read(name, encoding) {
            console.log("read", name, encoding);
            return zipFile.file(name).async("uint8array").then(function(array) {
                if (encoding === "base64") {
                    console.log("read base64 - fromByteArray");
                    return base64js.fromByteArray(array);
                } else if (encoding) {
                    console.log("read encoding", encoding);
                    var decoder = new TextDecoder(encoding);
                    return decoder.decode(array);
                } else {
                    console.log("read array");
                    return array;
                }
            });
        }

        function write(name, contents) {
            console.log("write", name, contents);
            zipFile.file(name, contents);
        }

        function toArrayBuffer() {
            console.log("toArrayBuffer");
            return zipFile.generateAsync({type: "arraybuffer"});
        }

        console.log("zipFile", zipFile);

        return {
            exists: exists,
            read: read,
            write: write,
            toArrayBuffer: toArrayBuffer
        };
    });
}

function splitPath(path) {
    var lastIndex = path.lastIndexOf("/");
    if (lastIndex === -1) {
        return {dirname: "", basename: path};
    } else {
        return {
            dirname: path.substring(0, lastIndex),
            basename: path.substring(lastIndex + 1)
        };
    }
}

function joinPath() {
    var nonEmptyPaths = Array.prototype.filter.call(arguments, function(path) {
        return path;
    });

    var relevantPaths = [];

    nonEmptyPaths.forEach(function(path) {
        if (/^\//.test(path)) {
            relevantPaths = [path];
        } else {
            relevantPaths.push(path);
        }
    });

    return relevantPaths.join("/");
}
