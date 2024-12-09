const grid = document.getElementById('grid');

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Creating a grid element
function createGridDiv(content) {
  const div = document.createElement('div');
  div.classList.add('grid-item');

  const width = 250;
  const height = 250;
  div.style.width = `${width}px`;
  div.style.height = `${height}px`;

//image and text styling
  if (content.class === "Image") {
    const imageUrl = content.image.display.url;
    const minSize = 5; 
    const maxSize = 14; 
    const vwWidth = Math.min(Math.max(minSize, 14), maxSize); 
    div.style.width = `${vwWidth}vw`;
    div.innerHTML = `<img src="${imageUrl}" style="width: 100%;">`;
  } else {
    div.style.fontSize = `${randomRange(7, 21)}pt`;
    // div.style.backgroundColor = `#FFFCF4`;
    div.style.padding = `1%`;
    div.innerHTML = content.content_html;
  }
  div.style.zIndex = randomRange(1, 100);
  return div;
}

//Using CSS grid to as foundation for the generated content
function generateGrid(contents) {
  grid.innerHTML = ''; 
  grid.style.display = 'grid'; 
  grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(100px, 1fr))';
  grid.style.gap = '10px'; 

  //limiting amt of content added based on screensize
  const numItems = Math.floor(window.innerWidth / 60) * Math.floor(window.innerHeight / 60); 

  //adding the generated content into a set to keep track of whats been added - prevents duplicates
  //used chatgpt to help with lines 47-63
  let i = 0;
  let addedUrls = new Set(); 

  function addItem() {
    //check if added items is less than numitems, if it is: 
    //randomly choose a piece of image/text content taken from a URL --> give each content a unique key
    if (i < numItems) {
      const content = contents[Math.floor(Math.random() * contents.length)]; // Randomly pick content
      const contentKey = content.image?.display?.url || content.content_html;

      //add item if its unique by creating a new div el
      // Add the content's key to the Set to prevent duplicates
      if (!addedUrls.has(contentKey)) {
        const div = createGridDiv(content);
        addedUrls.add(contentKey); 
        grid.appendChild(div); 
        i++;

        //jquery drag and drop for content & bring items to front when selected
        $(div).draggable({
          containment: 'parent', 
          cursor: 'move',
          start: function() {
            $(this).css('z-index', 100); 
          }
        });

        //after clicking image, remove from DOM with keypress 'x'
        $(div).click(function(event) {
          $(document).keydown(function(e) {
            if (e.key === 'x') {
              $(div).remove();
              $(document).off('keydown'); //unbind keydown event
            }
          });
        });
      }
      setTimeout(addItem, 10);
    }
  }

  addItem();
}

let handleGenerate = () => {
  let url1 = document.getElementById('url1').value;
  let url2 = document.getElementById('url2').value;
  let url3 = document.getElementById('url3').value;

  //void empty urls
  let urls = [url1, url2, url3].filter(url => url); 

  let contentsEl = document.getElementById('grid');

  //clear page content before replacing with are.na content
  contentsEl.innerHTML = '';

  urls.forEach(url => {
    fetch(`https://api.are.na/v2/channels/${url}`)
      .then(response => response.json())
      .then(data => {
        generateGrid(data.contents); 
      })
      .catch(error => console.error(error));
  });
};