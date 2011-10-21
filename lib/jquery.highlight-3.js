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
 var myIndexOf, migemoRegexp;
 if( opt.useMigemo ) {
   migemoRegexp = new RegExp("");
  if( opt.ignoreCase ) {
   migemoRegexp.compile( MigemoJS.getRegExp(pat), "i" );
  } else {
   migemoRegexp.compile( MigemoJS.getRegExp(pat) );
  }

  myIndexOf = function(data, pat) {
   matched = migemoRegexp.exec( data );
   if( matched ) {
    return {
     pos : matched.index,
     len : matched[0].length
    };
   } else {
    return {
     pos : -1,
     len : -1
    };
   }
  };
 } else if( opt.ignoreCase ) {
  myIndexOf = function(data, pat) {
   return {
    pos : data.toUpperCase().indexOf(pat),
    len : pat.length
   };
  };
 } else {
  myIndexOf = function(data, pat) {
   return {
    pos : data.indexOf(pat),
    len : pat.length
   };
  };
 }

 function innerHighlight(node, pat, opt) {
  var skip = 0;
  if (node.nodeType == 3) {
   var matched = myIndexOf( node.data, pat );
   if (matched.pos >= 0) {
    var spannode = document.createElement('span');
    spannode.className = 'vichrome-highlight';
    var middlebit = node.splitText(matched.pos);
    var endbit = middlebit.splitText(matched.len);
    var middleclone = middlebit.cloneNode(true);
    spannode.appendChild(middleclone);
    middlebit.parentNode.replaceChild(spannode, middlebit);
    skip = 1;
   }
  }
  else if (node.nodeType == 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
  if( !node.id.indexOf || node.id.indexOf("vichrome") < 0 )
   var len = node.childNodes.length;
   for (var i = 0; i < len; ++i) {
    i += innerHighlight(node.childNodes[i], pat, opt);
   }
  }
  return skip;
 }

 if(!opt) {
   opt = {};
   opt.ignoreCase = true;
 }
 if(opt.ignoreCase)
  var pat_ = pat.toUpperCase();
 else
  var pat_ = pat;
 return this.each(function() {
  innerHighlight(this, pat_, opt);
 });
};

jQuery.fn.removeHighlight = function() {
 return this.find("span.vichrome-highlight").each(function() {
  this.parentNode.firstChild.nodeName;
  with (this.parentNode) {
   replaceChild(this.firstChild, this);
   normalize();
  }
 }).end();
};
