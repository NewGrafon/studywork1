document.querySelector("#loaderBtn").addEventListener("change", function () {
    if (this.files[0]) {
      var fr = new FileReader();
  
      fr.addEventListener("load", function () {
        document.querySelector("#imgLoaderLabel").style.backgroundImage = "url(" + fr.result + ")";
      }, false);
  
      fr.readAsDataURL(this.files[0]);

      document.querySelector('.uSP_uploadIco').remove();
    }
  });