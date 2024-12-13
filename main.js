const grid = document.getElementById('grid');

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Creating grid layout
function createGridDiv(content) {
  const div = document.createElement('div');
  div.classList.add('grid-item');

  const width = 250;
  const height = 250;
  div.style.width = `${width}px`;
  div.style.height = `${height}px`;

  // Image and text styling
  if (content.class === "Image") {
    const imageUrl = content.image.display.url;
    const minSize = 5; 
    const maxSize = 11; 
    const vwWidth = Math.min(Math.max(minSize, 11), maxSize); 
    div.style.width = `${vwWidth}vw`;
    div.innerHTML = `<img src="${imageUrl}" style="width: 100%; height: auto;">`;
  } else {
    div.style.fontSize = `${randomRange(7, 21)}pt`;
    div.style.padding = `1%`;
    div.innerHTML = content.content_html;
  }
  
  div.style.zIndex = randomRange(1, 100);
  return div;
}

// Using CSS grid as foundation for the generated content
function generateGrid(contents) {
  grid.innerHTML = ''; 
  grid.style.display = 'grid'; 
  grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(100px, 1fr))';
  grid.style.gap = '15px'; 

  // Limiting the number of content added based on screen size
  const numItems = Math.floor(window.innerWidth / 60) * Math.floor(window.innerHeight / 60); 
  let i = 0;
  let addedUrls = new Set(); 

  function addItem() {
    // Check if added items are less than numItems
    if (i < numItems) {
      const content = contents[Math.floor(Math.random() * contents.length)];
      const contentKey = content.image?.display?.url || content.content_html;

      // Add item if it's unique
      if (!addedUrls.has(contentKey)) {
        const div = createGridDiv(content);
        addedUrls.add(contentKey);
        grid.appendChild(div);
        i++;

        // jQuery drag and drop for content
        $(div).draggable({
          containment: 'parent', 
          cursor: 'move',
          start: function() {
            $(this).css('z-index', 100); 
          }
        });

        // After clicking image, remove from DOM with keypress 'x'
        $(div).click(function(event) {
          $(document).keydown(function(e) {
            if (e.key === 'x') {
              $(div).remove();
              $(document).off('keydown'); // Unbind keydown event
            }
          });
        });
      }
      setTimeout(addItem, 10);
    }
  }

  // Add blank spaces randomly dispersed
  function addBlankSpaces() {
    const numBlanks = randomRange(1, Math.floor(numItems / 4)); // 1/4th of the grid can be blank
    for (let j = 0; j < numBlanks; j++) {
      const blankDiv = document.createElement('div');
      blankDiv.classList.add('grid-item', 'blank-space');
      blankDiv.style.width = '500px'; 
      blankDiv.style.height = '500px'; 
      blankDiv.style.position = 'absolute';
      blankDiv.style.top = `${randomRange(0, grid.clientHeight - 500)}px`;
      blankDiv.style.left = `${randomRange(0, grid.clientWidth - 500)}px`; // Random position within grid
      grid.appendChild(blankDiv);
    }
  }

  addBlankSpaces(); // Call to add blank spaces
  addItem();
}

let handleGenerate = () => {
  let url1 = document.getElementById('url1').value;
  let url2 = document.getElementById('url2').value;
  let url3 = document.getElementById('url3').value;

  // Void empty URLs
  let urls = [url1, url2, url3].filter(url => url); 

  let contentsEl = document.getElementById('grid');

  // Clear page content before replacing with Are.na content
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
