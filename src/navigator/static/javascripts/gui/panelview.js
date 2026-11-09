function PanelView(collapseImage, expandImage) {

  this._collapseImage = collapseImage;
  this._expandImage =  expandImage;

};

PanelView.prototype.decorate = function (buttonId, imageId, panelId, expand) {
  var _this = this;

  document.getElementById(panelId).style.display = (expand) ? "block" : "none";
  document.getElementById(imageId).src = (expand) ? _this._collapseImage : _this._expandImage;
 

  document.getElementById(buttonId).addEventListener('click', function () {
    if (document.getElementById(panelId).style.display === "none" || document.getElementById(panelId).style.display === "") {
      document.getElementById(panelId).style.display = "block";
      document.getElementById(imageId).src = _this._collapseImage;
    } else {
      document.getElementById(panelId).style.display = "none";
      document.getElementById(imageId).src = _this._expandImage;
    }
  });

}
