//audio-user-interface

function audibleElement(elementOptions) {
  let o = elementOptions;
  if (o.parentElement) this.parentElement = o.parentElement;
  if (o.subElements) {
    this.subElements = o.subElements;
    this.activeElement = null;
  }
  if (o.id) {
    this.id = o.id;
  }
  this.content = o.content;
  this.pretext = o.pretext;
  this.description = o.description;
  this.type = o.type;
  this.queryString = o.queryString || false; //its always usefull
  switch (o.type) {
    case "toggle":
      // this.value=o.value || false;
      //better store value somewhere else where it is yet stored
      //but optional for future features could be interesting:
      // if(o.value!=undefined)this.value=o.value;
      // this.queryString = o.queryString || false;
      break;
    case "button":
      // this.queryString = o.queryString || false;
      this.activateMessage = o.activateMessage || false;
      break;
    case "textfield":
      // this.queryString = o.queryString || false;
      break;
    case "textarea":
      // this.queryString = o.queryString || false;
      break;
    case "link":
      this.href = o.href || false;
      break;
    case "select":
      // this.queryString = o.queryString || false;
      // this.options = o.options || false; not needed, better use nested object in subElements
      break;
    case "option":
      this.value = o.value;
      break;
  }

}


audio_user_interface = {
  autoRead: {
    hints: true,
  },
  globalHelpCount: 0,
  elements: [{

  }],
  idelements: {

  },
  phraseDividers: ['.', '!', '?'],
  currentReadPos: 0,
  main: null,
  activeElement: null,
  activeDialogues: {},
  // addElement: function(audibleElement){},
  formElementCountingString: function(audibleElement, elementsNames, containNames) {
    let en = elementsNames || {
      singular: 'element',
      plural: 'elements'
    };
    let cn = containNames || {
      singular: 'contains',
      plural: 'containing'
    };
    if (typeof en == 'string') en = {
      singular: elementsNames,
      plural: elementsNames
    };
    if (typeof cn == 'string') cn = {
      singular: containNames,
      plural: containNames
    };
    if (!audibleElement.subElements) return '';
    if (audibleElement.subElements.length > 1) return ', ' + cn.plural + ' ' + audibleElement.subElements.length + ' ' + en.plural;
    return cn.singular + ' 1 ' + en.singular;
  },
  formIdString: function(audibleElement) {
    if (!audibleElement.id) return '';
    return ', with id ' + audibleElement.id;
  },
  formHintString: function(audibleElement, forceFeedback) {
    let ae = audibleElement;
    let t = '. ';
    if (ae.description) t += 'press d for description. ';
    switch (ae.type) {
      case 'textfield':
        t += 'press Enter to enter edit-modus, again Enter to return to audio user interface. ';
        break;
      case 'button':
        t += 'press Enter to activate. ';
        break;
    }
    if (this.globalHelpCount < 2) {
      t += 'press shift and h for global Help. ';
      this.globalHelpCount++;
    }
    if (forceFeedback && t == '. ') {
      t += 'no specific help for this element defined. ';
      t += 'press r to read element, press control and r to read element with all of its subelements';
      t += 'press shift and h for global Help. ';
    }
    return t;
  },
  formGlobalHelpString: function() {
    let t = `
Arrow Down: Move to next element in tree. If element has subelements it enters subelements.
control and arrow down: Move to next Sibling in tree, not entering subelements.
Arrow Up: Move to previous element in tree. if previous sibling has subelements start with last and most profound subelement of tree.
control and arrow up: move to previous sibling of element. if it is first subelement of its parent move to parent.
r: read current element.
control and r: read current element with all of its subelements .
d: read description of current element. if no description is defined it will not read anything.
w: read where am i, to get overview of where in the tree i am currently.
control and w: read whole path to get to where i am now.
h: read help for elements such as special keystrokes.
n: enter navigation tree.
m: enter main content tree.
l: enter line-reading mode: reads element content by line. press l to read next line in queue.
.: enter phrase-reading mode: reads element content divided by . ! and ?.
Enter: activate current interactive element.
      `
    return t;
  },
  formStringOfElement: function(audibleElement, options) {
    let ae = audibleElement;
    let o = options || {};
    let t = ae.content;
    if (ae.pretext) t = ae.pretext + ", " + t;
    if (ae.postext) t += ', ' + ae.postext;
    switch (ae.type) {
      case "container":
        if (!o.dontShowId) t += ', ' + this.formIdString(ae);
        t = 'container, ' + t;
      case "list":
        if (!o.dontcount) t += ', ' + this.formElementCountingString(ae);
        break;
      case 'textfield':
        tf = document.querySelector(ae.queryString);
        if (tf) {
          if (tf.value.lenth > 0) t = 'textfield ' + t + ', with value, ' + tf.value;
          else t = 'empty textfield ' + t;
        }
        break;
      case 'button':
        t = 'button ' + t;
        break;
      case 'toggle':
        tf = document.querySelector(ae.queryString);
        if (tf) {
          let value;
          if (tf.type == 'checkbox') value = tf.checked;
          t = 'toggle ' + t + ', state ' + value;
          // if(tf.value || tf.value=='true')t+=', '
          // else t='empty textfield '+t;
        }
        break;
      case 'select':
        t = 'multiple choice, ' + t + this.formElementCountingString(ae, 'options', 'with');
        tf = document.querySelector(ae.queryString);
        if (tf && tf.value) {
          for (let si = 0; si < ae.subElements.length; si++) {
            if (tf.value == ae.subElements[si].value) {
              t += ', selected option: ' + ae.subElements[si].content;
              break;
            }
          }
        }
        break;
    }
    return t;
  },
  formStringOfWholeElement: function(audibleElement) {
    let t = this.formStringOfElement(audibleElement);
    if (!audibleElement.subElements) return t;
    for (let i = 0; i < audibleElement.subElements.length; i++) {
      t += '\n , ';
      t += this.formStringOfWholeElement(audibleElement.subElements[i]);
    }
    return t;
  },
  activateElement: function(audibleElement) {
    let ae = audibleElement || this.activeElement;
    if (!ae) return null;
    let ret = null;
    switch (ae.type) {
      case 'button':
        if (ae.queryString) {
          let b = document.querySelector(ae.queryString);
          if (b) b.click();
          else console.warn('query selector wrong, no such button found', ae);
          ret = 'activated button ' + ae.content;
          if (ae.activateMessage) ret += '. ' + ae.activateMessage;
        }
        break;
      case 'textfield':
        if (ae.queryString) {
          let tf = document.querySelector(ae.queryString);
          if (document.activeElement == tf) {
            //leave textarea
            this.outputPolite.focus();
            ret = 'left textfield ' + ae.content + ' with value , ' + tf.value;
          } else {
            //enter textarea
            ret = 'entered textfield ' + ae.content + '. current value ' + tf.value;
            if (tf.value.length == 0) ret = 'entered empty textfield ' + ae.content;
            tf.focus();
          }
        }
        break;
      case 'link':
        if (ae.href) {
          ret = 'following link to ' + ae.href
          //maybe we can delay this to give feedback to user? how?
          //we dont know how long it takes the screenreader to read out
          setTimeout(function() {
            document.location = ae.href;
          }, 5000);
        }
        break;
      case 'toggle':
        if (ae.queryString) {
          let tf = document.querySelector(ae.queryString);
          if (tf.type == 'checkbox') {
            let newval = !tf.checked;
            tf.checked = newval;
            ret = 'set toggle state to ' + newval;
          }
        }
        break;
      case 'option':
        if (ae.parentElement.type == 'select') {
          let select = document.querySelector(ae.parentElement.queryString);
          if (!select) return ret;
          if (select.tagName.toLowerCase() == 'select') {
            select.value = ae.value;
            let ind = this.getIndexInParent(ae) + 1;
            ret = 'chose option ' + ind + ' of ' + ae.parentElement.content + ', ' + ae.content;
          }
          if (select.tagName.toLowerCase() == 'radio') {
            select.checked = true;
            ret = 'chose option ' + ae.content;
          }
          this.selectElement(ae.parentElement);
          setTimeout(function() {
            audio_user_interface.readElement();
          }, 500)
        }
        break;
    }
    return ret;
  },
  selectElement: function(audibleElement, options) {
    this.activeElement = audibleElement;
    let oldNode = document.getElementsByClassName('aui-pseudo-focused');
    while (oldNode.length > 0) oldNode[0].classList.remove('aui-pseudo-focused');
    if (audibleElement.queryString) {
      let el = document.querySelector(audibleElement.queryString);
      if (el) el.classList.add('aui-pseudo-focused');
    }
    this.currentReadPos = 0; //reset current Reading Pos as we read Element from anew
    if (options && options.readPos) this.currentReadPos = options.readPos; //to set it manualy if needed
  },
  selectElementById: function(id) {
    if (this.idelements[id]) this.selectElement(this.idelements[id]);
  },
  selectNextElement: function() {
    if (this.activeElement == null) return false;
    let ne = this.getNextElement(this.activeElement);
    if (ne) this.selectElement(ne);
  },
  selectNextSibling: function() {
    if (this.activeElement == null) return false;
    if (!this.activeElement.parentElement) return false;
    let ne = this.getNextSibling(this.activeElement);
    if (ne) this.selectElement(ne);
  },
  selectPreviousElement: function() {
    if (this.activeElement == null) return false;
    let pe = this.getPreviousElement(this.activeElement);
    if (pe) this.selectElement(pe);
  },
  selectPreviousSibling: function() {
    if (this.activeElement == null) return false;
    let pe = this.getPreviousSibling(this.activeElement);
    if (pe) this.selectElement(pe);
  },
  getNextElement: function(audibleElement, noSubElement) {
    if (audibleElement.subElements && audibleElement.subElements.length > 0 && noSubElement != true) return audibleElement.subElements[0];
    //get next Element:
    let founde = null;
    let acte = audibleElement;
    while (founde == null) {
      let parent = acte.parentElement;
      if (parent === undefined) return false;
      let index = null;
      for (let i = 0; i < parent.subElements.length; i++) {
        if (parent.subElements[i] == acte) {
          index = i + 1;
          break;
        }
      }
      if (index != null && index < parent.subElements.length) {
        founde = parent.subElements[index];
        break;
      }
      acte = parent;
    }
    return founde;
  },
  getPreviousElement: function(audibleElement) {
    let previousSibling = this.getPreviousSibling(audibleElement);
    if (previousSibling == audibleElement.parentElement) return previousSibling; //without siblings the parent is the next previous element
    let acte = previousSibling;
    while (acte.subElements && acte.subElements.length > 0) {
      acte = acte.subElements[acte.subElements.length - 1];
    }
    return acte;
  },
  getNextSibling: function(audibleElement) {
    let parent = audibleElement.parentElement;
    let index = -1;
    for (let i = 0; i < parent.subElements.length; i++) {
      if (parent.subElements[i] == audibleElement) {
        index = i + 1;
        break;
      }
    }
    if (index >= 0 && index < parent.subElements.length) return parent.subElements[index];
    //return false;
    //try next Element, but without subelements
    return this.getNextElement(parent.subElements[parent.subElements.length - 1], true)
  },
  getPreviousSibling: function(audibleElement) {
    //get previous Element in tree (either sibling or parent):
    let parent = audibleElement.parentElement;
    if (!parent) return false;
    let index = -1;
    for (let i = 0; i < parent.subElements.length; i++) {
      if (parent.subElements[i] == audibleElement) {
        index = i - 1;
        break;
      }
    }
    if (index >= 0) return parent.subElements[index];
    return parent;
  },
  getIndexInParent: function(audibleElement) {
    let parent = audibleElement.parentElement;
    if (!parent) return -1;
    let index = -1;
    for (let i = 0; i < parent.subElements.length; i++) {
      if (parent.subElements[i] == audibleElement) {
        index = i;
        break;
      }
    }
    return index;
  },
  getElementArray: function(audibleElement, compareobj) {
    if (!compareobj && !audibleElement.subElements) return [audibleElement];
    let keys = Object.keys(compareobj);
    let found = true;
    for (let x = 0; x < keys.length; x++) {
      if (compareobj[keys[x]] != audibleElement[keys[x]]) found = false;
    }
    if (!audibleElement.subElements) {
      if (found) return [audibleElement];
      return [];
    }
    let ret = [];
    if (found) ret.push(audibleElement);
    for (x = 0; x < audibleElement.subElements.length; x++) {
      ret = ret.concat(this.getElementArray(audibleElement.subElements[x]));
    }
    return ret;
  },
  parseJsonTree: function(jsonobj, parent) {
    let node = new audibleElement({
      content: jsonobj.content,
      type: jsonobj.type,
      parentElement: parent,
      pretext: jsonobj.pretext,
      id: jsonobj.id,
      queryString: jsonobj.queryString,
      activateMessage: jsonobj.activateMessage,
      description: jsonobj.description,
      value: jsonobj.value,
    });
    if (jsonobj.id) this.idelements[jsonobj.id] = node;
    // if(jsonobj.type=="select")node.options=jsonobj.options;
    if (jsonobj.subelements) {
      node.subElements = [];
      for (let x = 0; x < jsonobj.subelements.length; x++) {
        node.subElements.push(this.parseJsonTree(jsonobj.subelements[x], node));
      }
    }
    return node;
  },
  loadMain: function(jsonobj) {
    this.main = this.parseJsonTree(jsonobj);
    // this.activeElement = this.main;
    this.selectElement(this.main);
    if (!this.outputPolite) this.outputPolite = document.getElementById('aui-output-polite');
    this.outputPolite.focus();
    this.readElement();
  },
  openDialog: async function(jsonobj) {
    let dialog = this.parseJsonTree(jsonobj, {
      dontLinkIds: true
    });
    dialog.returnToElement = this.activeElement;
    let id = jsonobj.id;
    if (!jsonobj.id) {
      id = 'dialog' + this.activeDialogues.length;
      let did = this.activeDialogues.length;
      while (this.activeDialogues[id]) {
        did++;
        id = 'dialog' + did;
      }
    }
    this.activeDialogues[id] = dialog;
    let flattened = this.getElementArray({
      type: 'button'
    });
    let closefunction = function() {
      audio_user_interface.closeDialog(this.auid);
      this.removeEventListener(closefunction);
    }
    for (let i = 0; i < flattened.length; i++) {
      let button = document.querySelector(flattened[i].queryString);
      if (!button) continue;
      button.auid = id;
      button.addEventListener('click', closefunction);
    }
    this.selectElement(dialog);
    return id;
  },
  closeDialog: function(id) {
    let dialog = this.activeDialogues[id];
    if (!dialog) {
      //we dont know where to go - return to main
      this.selectElement(this.main);
      this.readElement(this.activeElement, 'closed dialog, returned to main content');
      return false;
    }
    this.selectElement(dialog.returnToElement);
    this.readElement(this.activeElement, 'closed dialog, returned to ');
  },
  readElement: function(audibleElement, before, after) {
    let ae = audibleElement || this.activeElement;
    if (!ae) return false;
    let outputstring = this.formStringOfElement(ae);
    if (before) outputstring = before + ', ' + outputstring;
    if (after) outputstring += ', ' + after;
    if (this.autoRead.hints) {
      outputstring += '. ' + this.formHintString(ae);
    }
    this.outputText(outputstring);
    console.log('reading', outputstring);
  },
  readWholeElement: function(audibleElement) {
    let ae = audibleElement || this.activeElement;
    if (!ae) return false;
    let outputstring = this.formStringOfWholeElement(ae);
    this.outputText(outputstring);
    console.log('reading whole element', outputstring);
  },
  readDescription: function(audibleElement) {
    let ae = audibleElement || this.activeElement;
    if (!ae) return false;
    let outputstring = ae.description;
    this.outputText(outputstring);
    console.log('reading description', outputstring);
  },
  readHelpOfElement: function(audibleElement) {
    let ae = audibleElement || this.activeElement;
    if (!ae) return false;
    let outputstring = '. ' + this.formHintString(ae, true);
    this.outputText(outputstring);
  },
  readGlobalHelp: function() {
    let outputstring = this.formGlobalHelpString();
    this.outputText(outputstring);
  },
  readElementByLine: function(audibleElement) {
    let ae = audibleElement || this.activeElement;
    if (!ae) return false;
    let end = ae.content.indexOf('\n', this.currentReadPos);
    if (end == -1) end = ae.content.length;
    let t = ae.content.substring(0, end);
    if (t.length > 0) this.outputText(t);
    this.currentReadPos = end;
  },
  readElementByPhrase: function(audibleElement) {
    let ae = audibleElement || this.activeElement;
    if (!ae) return false;
    if (this.currentReadPos == undefined) this.currentReadPos = 0;
    let dividers = this.phraseDividers;
    let end = ae.content.length;
    for (let x = 0; x < dividers.length; x++) {
      let pos = ae.content.indexOf(dividers[x], this.currentReadPos);
      if (pos < end && pos > -1) end = pos + 1;
    }
    // if(end==-1)end=ae.content.length;
    let t = ae.content.substring(this.currentReadPos, end);
    if (t.length > 0) this.outputText(t);
    this.currentReadPos = end;
  },
  readElementByWord: function(audibleElement, backwards) {
    let ae = audibleElement || this.activeElement;
    if (!ae) return false;
    if (this.currentReadPos >= ae.content.length && !backwards) return false;
    if (backwards && this.currentReadPos <= 0) return false;
    let end = this.currentReadPos;
    if (backwards) end = ae.content.lastIndexOf(' ', this.currentReadPos - 1);
    else end = ae.content.indexOf(' ', this.currentReadPos + 1);
    if (end == -1) {
      if (backwards) end = 0;
      else end = ae.content.length;
    }
    console.log('read word from to:', this.currentReadPos, end);
    let t = ae.content.substring(this.currentReadPos, end);
    this.outputText(t);
    this.currentReadPos = end;
  },
  readElementByChar: function(audibleElement, backwards) {
    let ae = audibleElement || this.activeElement;
    if (!ae) return false;
    if (this.currentReadPos >= ae.content.length && !backwards) return false;
    if (backwards) {
      if (this.currentReadPos <= 0) return false;
      this.currentReadPos -= 2; //we want to get to the last char
      if (this.currentReadPos < 0) this.currentReadPos = 0;
    }
    let t = ae.content[this.currentReadPos];
    this.currentReadPos++;
    this.outputText(t);
  },
  whereAmI: function() {
    let ae = this.activeElement;
    if (!ae) return 'you are out of reach';
    let index = this.getIndexInParent(ae);
    let ret = '';
    if (index != -1) ret = 'you are on element number ' + (index + 1) + ' of parent ' + this.formStringOfElement(ae.parentElement, {
      dontcount: true,
      dontShowId: true
    }) + ': ';
    // ret+='. parent element would be '+this.formStringOfElement(ae.parentElement);
    ret += this.formStringOfElement(ae);
    // return ret;
    this.outputText(ret);
  },
  outputText: function(outputstring) {
    if (!this.outputPolite) this.outputPolite = document.getElementById('aui-output-polite');
    this.outputPolite.innerHTML = outputstring;
  },
  reactOnKeystroke: function(key, metaobj) {
    //key is the js-char-representation of the key - like 'k' or 'K' when shift/capslock is pressed
    switch (key) {
      case 'ArrowDown':
        if (metaobj.ctrl) this.selectNextSibling();
        else this.selectNextElement();
        this.readElement(this.activeElement);
        console.log('down to', this.activeElement);
        break;
      case 'ArrowUp':
        if (metaobj.ctrl) this.selectPreviousSibling();
        else this.selectPreviousElement();
        this.readElement(this.activeElement);
        console.log('up to', this.activeElement);
        break;
      case 'ArrowLeft':
        if (metaobj.ctrl) this.readElementByWord(null, true);
        else this.readElementByChar(null, true);
        break;
      case 'ArrowRight':
        if (metaobj.ctrl) this.readElementByWord();
        else this.readElementByChar();
        break;
      case '.':
        // if(metaobj.ctrl)this.readElementByWord();
        // else
        this.readElementByPhrase();
        break;
      case 'l':
        // if(metaobj.ctrl)this.readElementByWord();
        // else
        this.readElementByLine();
        break;
      case 'Enter':
        // if(metaobj.ctrl)this.activateElement();
        let activatemsg = this.activateElement();
        // this.readElement(this.activeElement, 'activated');
        if (activatemsg) this.readElement({
          content: activatemsg
        });
        console.log('activated', this.activeElement);
        break;
      case 'r':
        if (metaobj.ctrl) this.readWholeElement();
        else this.readElement();
        break;
      case 'd':
        this.readDescription();
        break;
      case 'w':
        if (metaobj.ctrl) this.whereAmI(true);
        else this.whereAmI();
        break;
      case 'h':
        this.readHelpOfElement();
        break;
      case 'H':
        this.readGlobalHelp();
        break;
    }
  },
  init: function(directKeystrokes, contentobj) {
    if (directKeystrokes) {
      document.addEventListener('keyup', function(e) {
        if (e.target.tagName.toLowerCase() == 'input' && e.key != 'Enter') return;
        // console.log(e);
        audio_user_interface.reactOnKeystroke(e.key, {
          ctrl: e.ctrlKey
        });
      })
    }
    if (contentobj) {
      this.content = {};
      this.content.main = this.parseJsonTree(contentobj.main);
      this.activeElement = this.content.main;
      this.readElement(this.activeElement);
    }
    this.outputPolite = document.getElementById('aui-output-polite');
  }
}
audio_user_interface.init(true);
var aui = audio_user_interface;