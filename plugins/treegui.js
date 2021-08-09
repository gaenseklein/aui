//add tree-drawing-gui representation of aui:
//needs output-DOM-element with id aui-tree 
aui.buildParentPath = function(element){
  let res = [element];
  if(element.parentElement)return res.concat(this.buildParentPath(element.parentElement));
  return res;
}
aui.getRootOfElement = function(element){
  if(element.parentElement)return this.getRootOfElement(element.parentElement);
  return element;
}

aui.buildTree = function(root){
  let res = document.createElement('div');
  res.classList.add('aui-tree-wrapper');
  let content = document.createElement('span');
  content.classList.add('content');
  content.innerText = root.content;
  res.appendChild(content);
  if(root.subElements){
    res.classList.add('container');
    for(let i=0;i<root.subElements.length;i++){
      res.appendChild(this.buildTree(root.subElements[i]));
    }
  }
  root.auiTreeObject=res;
  root.auiTreeContent=content;
  return res;
}

aui.drawTree = function(root){
  let r=root || this.main;
  if(!r){
    r=aui.buildNavigationJsonTree();
    aui.loadMain(r);
  }
  let target = document.getElementById('aui-tree');
  target.innerHTML = '';
  let tree = this.buildTree(r);
  target.appendChild(tree);
  this.activatePathToObject();
}

aui.activatePathToObject = function(element){
  let e=element || aui.activeElement;
  let oldelements = document.getElementsByClassName('aui--in-path');
  while(oldelements.length>0)oldelements[0].classList.remove('aui--in-path');
  if(!e)return;
  let newelements = this.buildParentPath(e);
  for(let i=0;i<newelements.length;i++){
    newelements[i].auiTreeObject.classList.add('aui--in-path');
  }
  if(e.auiTreeContent)e.auiTreeContent.classList.add('aui--in-path');
}

//adding draw-tree on each select active element:
aui.addPlugin({
  hookOnSelectElement: function(audibleElement, options){
    // aui.activatePathToObject(audibleElement);
    let root = aui.getRootOfElement(audibleElement);
    aui.drawTree(root);
  }
})
