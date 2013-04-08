var util = require("util");

var _ = require("underscore");

exports.HtmlGenerator = HtmlGenerator;


function HtmlGenerator() {
    var stack = [];
    var fragments = [];
    
    function text(value) {
        if (value.length > 0) {
            writeAll();
            fragments.push(escapeHtml(value))
        }
    }
    
    function asString() {
        return fragments.join("");
    }
    
    function append(otherHtmlGenerator) {
        if (otherHtmlGenerator._fragments.length > 0) {
            writeAll();
        }
        otherHtmlGenerator._fragments.forEach(function(fragment) {
            fragments.push(fragment);
        });
    }
    
    function satisfyPath(style) {
        var firstFreshPartIndex = findIndex(style, function(part) {
            return part.fresh;
        });
        
        var partIndex = 0;
        while (partIndex < firstFreshPartIndex && stylePartMatchesStackElement(style[partIndex], stack[partIndex])) {
            partIndex++;
        }
        while (stack.length > partIndex) {
            close();
        }
        for (; partIndex < style.length; partIndex++) {
            open(style[partIndex]);
        }
    }
    
    function stylePartMatchesStackElement(stylePart, stackElement) {
        return stackElement && stylePart.tagName === stackElement.htmlPathElement.tagName;
    }
    
    function open(element) {
        stack.push({
            htmlPathElement: element,
            written: false
        });
    }
    
    function close() {
        var stackElement = stack.pop();
        if (stackElement.written) {
            fragments.push(util.format("</%s>", stackElement.htmlPathElement.tagName));
        }
    }
    
    function closeAll() {
        while (stack.length > 0) {
            close();
        }
    }
    
    function writeAll() {
        stack.filter(function(element) {
            return !element.written;
        }).forEach(writeElement);
    }
    
    function writeElement(stackElement) {
        stackElement.written = true;
        var htmlPathElement = stackElement.htmlPathElement;
        var attributeString = generateAttributeString(htmlPathElement.attributes)
        fragments.push(util.format("<%s%s>", htmlPathElement.tagName, attributeString));
    }
    
    function selfClosing(element) {
        var attributeString = generateAttributeString(element.attributes)
        fragments.push(util.format("<%s%s />", element.tagName, attributeString));
    }
    
    function generateAttributeString(attributes) {
        return _.map(attributes, function(value, key) {
            return util.format(' %s="%s"', key, value);
        }).join("");
    }
    
    return {
        satisfyPath: satisfyPath,
        text: text,
        open: open,
        close: close,
        closeAll: closeAll,
        asString: asString,
        append: append,
        selfClosing: selfClosing,
        _fragments: fragments
    };
}


function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function findIndex(array, predicate) {
    for (var i = 0; i < array.length; i++) {
        if (predicate(array[i])) {
            return i;
        }
    }
    return -1;
}