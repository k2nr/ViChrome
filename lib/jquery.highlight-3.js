/*

highlight v3

Highlights arbitrary terms.

<http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html>

MIT license.

Johann Burkard
<http://johannburkard.de>
<mailto:jb@eaio.com>

*/

jQuery.fn.highlight = function(pat, opt) {
 function innerHighlight(node, pat, opt) {
  var skip = 0;
  if (node.nodeType == 3) {
   if( opt.ignoreCase ) {
    var pos = node.data.toUpperCase().indexOf(pat);
   } else {
    var pos = node.data.indexOf(pat);
   }
   if (pos >= 0) {
    var spannode = document.createElement('span');
    spannode.className = 'highlight';
    var middlebit = node.splitText(pos);
    var endbit = middlebit.splitText(pat.length);
    var middleclone = middlebit.cloneNode(true);
    spannode.appendChild(middleclone);
    middlebit.parentNode.replaceChild(spannode, middlebit);
    skip = 1;
   }
  }
  else if (node.nodeType == 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
   for (var i = 0; i < node.childNodes.length; ++i) {
    i += innerHighlight(node.childNodes[i], pat, opt);
   }
  }
  return skip;
 }
 return this.each(function() {
  if( !opt ) {
    opt = {};
    opt.ignoreCase = true;
  }
  if( opt.ignoreCase ) {
   innerHighlight(this, pat.toUpperCase(), opt);
  } else {
   innerHighlight(this, pat, opt);
  }
 });
};

jQuery.fn.removeHighlight = function() {
 return this.find("span.highlight").each(function() {
  this.parentNode.firstChild.nodeName;
  with (this.parentNode) {
   replaceChild(this.firstChild, this);
   normalize();
  }
 }).end();
};
