# audible user interface 
## informations for developers

---

## the tree

the audio-interface is made up by a tree, which the user can easily navigate. 
to navigate the user can use the up and down keys (or user-defined if you wish so) to go to the next/previous element in the tree or ctrl/cmd up and down to go to next or previous sibling (element in same level and branch of tree, e.g. all elements which share the same parent). 

to feed the tree we use a javascript-object which could be parsed from a json. 
as such it does not have a "parent" definition, but thats okay as its easily added afterwards. 

lets show a simplified example from a typical cms/blog (note that we could also "format" the body as a tree to even further better the user-experience): 

```
pagetitle
 |-> main content
        |-> title
        |-> author
        |-> date
        |-> body
        |-> footnotes
 |-> comments
    |-> comment list
    |     |-> comment 1
    |     |     |-> title
    |     |     |-> autor
    |     |     |-> date
    |     |     |-> content
    |     |-> comment 2
    |           |-> title
    |           |-> autor
    |           |-> date
    |           |-> content
    |-> add comment
```
---

## audible element

the elements of the tree are called audible elements. each element has at least one key-value pair - the `content`. 
this is the main part of the element and is read out if the element is selected or such. if you want to let audio-user-interface just speak out some text directly from your code just feed them with an object which contains this key-value pair, for example `aui.readElement({content: your_text})`. 

the next important part is the `subelements` to form the tree. in short here we fill in the subelements of the former. 

with these two key-value-pairs we are pretty close to a better user-experience. 

a simple element-tree would be like this:

```
audible_element = {
    content:'hi there',
    subelements:[
        {content:'you found me'}
    ],
}
```

---
## advanced example of building an audible object
lets take the example into object-form as it would be filled from a database:

```javascript
//given object 'main' and array 'comments' with comments from the database
//and for simplicity we have a ready-to-use audible-form for add-comment as 'audible_commentform'
//also we dont iterate as we normaly would do to add audible-comments:

page = {
    content: main.pagetitle,
    subelements:[
        {content: 'main area', subelements:[
            {content: main.title},
            {content: main.author},
            {content: main.date},
            {content: main.body},
            {content: main.footnotes},
        ]},
        {content: 'comment area', subelements:[
            {content: 'list with comments', subelements:[
                {content: 'comment 1', subelements:[
                    {content: comments[0].title},
                    {content: comments[0].author},
                    {content: comments[0].date},
                    {content: comments[0].body},
                ]},
                {content: 'comment 2', subelements:[
                    {content: comments[1].title},
                    {content: comments[1].author},
                    {content: comments[1].date},
                    {content: comments[1].body},
                ]},
            ]},
            {content: 'add comment', subelements:[
                {audible_commentform}
            ]},
        ]},                
    ],
}

```
 
seems easy to be filled dynamicaly.

---
## enhancing user-experience

to enhance the user-experience you can use optional key-value-pairs in audible Elements. for now there are

- `pretext`: text to be placed before the content when reading. usefull to declare information such as "title" or similar meta-information
- `id`: a unique identifier to have a shortcut to the element
- `description`: an alternate text to describe the current element if user presses 'd' - think of it like a tooltip
- `queryString`: a reference to a node in the DOM, aui adds the class `aui-pseudo-focus` to its classList when the element is selected, to mimic focus behaviour
- `type`: to create special elements you normaly start with using a unique type-identifier - such as 'button'

---
## special elements

for some elements you want the output to be specialized. therefore we start to implement specialized audible-elements. these elements can be separated into two main groups: interactive and non-interactive elements. to let the audible-user-interface communicate with the webpage, such as textfields, buttons, checkboxes, radio-fields etc. you can use these predefined interactive types

### non-interactive elements
- 'container': gives the user the information that its a grouping-element with X subelements. containers are meant to have shortcuts in the future via an id
- 'list': nearly the same as container, but with different future-plans (such as sortable lists) 

### interactive elements
- textfield: enters the textfield on pressing Enter, leaves textfield after pressing Enter in textfield
- button: activates a button
- toggle: activates/swichtes a toggle (checkbox for now)
- select: changes a select or radio button

all of the interactive elements have in common that they are expecting another key-value pair called `queryString`. the queryString must have a css-selector-definition to get exactly the html-node you want to access. 
---
##examples 

a button with id as selector:
```
html: <button id="my-button">some text</button>
aui-object: {type:'button', content:'some text', queryString:'#my-button'}
```

a textfield with a name:
```
html: <input type="textfield" name="myTextfield">
aui-object: {type:'textfield', content:'my textfield', queryString:'input[name=myTextfield]'}
```

we will continue with some more details about special elements
---
## links

definition: `type:'link'`
needs key: `href:'target of the link'`

a link does not talk with the DOM of the page but instead is followed directly.
if you want to have the user click a specific link in the DOM (to start a javascript-function or something alike) you should use type 'button' instead for the aui-object and a `queryString` to access the link in the DOM (and think about if you could replace the link in the DOM with a button for accessability-reasons too, as in fact button would be the reasonable solution). 
but maybe this will change in the future, as we progress further with the development. 

example:
```
{type:'link', content:'go to slidenotes.io', href:'https://slidenotes.io'}
```

---
## button

definition: `type:'button'`
needs key: `queryString:'CSS-QuerySelector of DOM-Element'`
additional key: `activateMessage:'message to be read to user after activating button'`

a aui-button binds the element to a DOM-Element and performs a click on the DOM-Element if aui-button is activated. 
reads 'activateMessage' if defined after user activated the button

example:
```
html: <button id="my-button">some text</button>
aui-object: {type:'button', content:'some text', queryString:'#my-button'}
```

---
## toggle
definition: `type:'button'`
needs key: `queryString:'CSS-QuerySelector of DOM-Element'`
*additional keys (not implemented yet): `on:'message to be read if state is on/true/checked', off:'message to be read if state is off/false/unchecked'`*
a toggle-aui-object should have as reference only an element which can have 2 states, either on or off, true or false etc. 
right now its implemented with checkboxes as DOM-element only. 

example:
```javascript
html: <input type="checkbox" id="chkb">
aui: {type:'toggle',content:'on off switch',queryString:'#chkb'}
```
---
## select/multichoice
definition: `type:'select'` 
needs key: `queryString:'CSS-QuerySelector of DOM-Element'`
needs subelements of `type:'option'` 

a multichoice aui-element lets the user select between different options for one element. as such it needs elements of type *option* as subelements.
as for now it is only implemented with a select-element in the DOM

if no subelements are defined aui will form option-subelements from given html-element 

example:
```
html: <select id="sel">...</select>
aui: {type:'select',content:'pick your choice',queryString:'#sel'}
```
---
## option
definition: `type:'option'`
needs parent with definition: `type:'select'` or `type:'multichoice'` 
needs key: `value:'value of option'`

just like in html the option needs a value which it can pass to the html. 
you can define options of selects indepenently from html if you wish to do so. 
like 
just make shure a valid value will be sent to the select
a full example of a select/option-combination:
```html
<select id="select1">
  <option value="first">first option</option>
  <option value="second">second option</option>
  <option value="third">third option</option>
</select>
```
```javascript
{content:'select an option', type:'select', 
 queryString:'#select1', subelements:[
   {content:'first option', type:'option', value:'first'},
   {content:'second option', type:'option',value:'second'},
   {content:'third option', type:'option',value:'third'},
  ]
}
```

remember: you can add a description to each aui-option and the aui-select if you want.
---
## dialog

sometimes the webpage needs to communicate to the aui to get a direct user feedback. in a gui this is normaly done with a dialog which pops up and gains focus. 
in the world of the aui, a dialog is a new tree. when the dialog gets closed the user is brought back to the old tree on the last selected element. 

to fire up a dialog you build a tree as you are used to it and pass an id to the root. then you can pass it to aui with `aui.openDialog(treeObject)`

to close the dialog you can fire `aui.closeDialog(dialogId)` from within your code where you would also close the gui-dialog.

example:
```javascript
//open the dialog
aui.openDialog({
    id:'status alert dialog',
    content:'status alert',
    subelements: [
       {content:'a status message the user has to react to'},
       {content:'ok', type:'button', queryString:'#dialogOk'},
       {content:'cancel', type:'button', queryString:'#dialogCancel'},
    ]
})
//close the dialog from within your code, for example after pressing #dialogOk or #dialogCancel
aui.closeDialog('status alert dialog');
```

---
## dialogclose
definition: `type:'dialogclose'`
needs key: `dialogId:'CSS-QuerySelector of DOM-Element'`

if you build an aui-only dialog you can use this to create a closebutton to the dialog. after activating the user will be brought back to the element last selected before the dialog opened. it is used for the global help menu for example, which is aui only and not represented with html.

example:
```javascript
//open an aui-only dialog
aui.openDialog({
    id:'status alert dialog',
    content:'status alert',
    subelements: [
       {content:'a status message the user has to react to'},
       {content:'back to content', type:'dialogclose', dialogId:'status alert dialog'},
    ]
})
```

---
## plugins 

aui has a plugin-system to let you easily create your own type of audibleElements. 
as an example the dialogclose button is build as a plugin:

```
var plugin_dialog_closed = {
  type:'dialogclose',
  activateElement: function(audibleElement){
    let ae=audibleElement || aui.activeElement;
    if(!ae || !ae.dialogId)return;
    aui.closeDialog(ae.dialogId);
  },
  extraKeys:['dialogId'],
}
aui.addPlugin(plugin_dialog_closed);
```

what it does is the following:
it describes a new element type with type:'dialogclose'
it gives an extra activateElement function which is fired if an element of defined type 'dialogclose' is activated
it defines additional keys with 'extraKeys' which are then parsed into audibleElements when building up the tree

with this you can add buttons and such which are not connected to the gui but still can interact directly with your app if you want. 
---
## keyboard-interaction

aui has to get keyboard-inputs to work. all keyboard-inputs should therefore be routed to `aui.reactOnKeystroke(keyString, metaobject)` - where keyString expects a String representing the key pressed (e.g. event.key) and metaobject an object with more detailed info, such as the event itself, to check for metakeys (ctrl/cmd) and such. 
you can alter the keyboard-layout by altering this function as well. 

if you dont use a keyboard-input-controller you can just initialize aui with aui.init(true). aui will then add an event-listener 'keyup' to the actual document. 

---
## multilingual

not supported yet, but we keep all the string-replacement-functions in well separated functions to add this ability later on
