'use strict';

const STORE = {
  items: [
    {id: cuid(), name: "apples", checked: false},
    {id: cuid(), name: "oranges", checked: false},
    {id: cuid(), name: "milk", checked: true},
    {id: cuid(), name: "bread", checked: false}
  ],
  hideCompleted: false,
  searchTerm: "",
};

function generateItemElement(item) {
  return `
    <li data-item-id="${item.id}">
      <span class="shopping-item js-shopping-item ${item.checked ? "shopping-item__checked" : ''}">${item.name}</span>
      <div class="shopping-item-controls">
        <button class="shopping-item-toggle js-item-toggle">
            <span class="button-label">check</span>
        </button>
        <button class="shopping-item-delete js-item-delete">
            <span class="button-label">delete</span>
        </button>
        <button class="shopping-item-edit js-item-edit">
            <span class="button-label">edit</span>
        </button>
      </div>
    </li>`;
}


function generateShoppingItemsString(shoppingList) {
  console.log("Generating shopping list element");

  const items = shoppingList.map((item) => generateItemElement(item));
  console.log(items.length + ' items.length');
  return items.join("");
}


function renderShoppingList() {
  // render the shopping list in the DOM
  console.log('`renderShoppingList` ran');

  // set up a copy of the store's items in a local variable that we will reassign to a new
  // version if any filtering of the list occurs
  let filteredItems = STORE.items;

  // if the `hideCompleted` property is true, then we want to reassign filteredItems to a version
  // where ONLY items with a "checked" property of false are included
  if (STORE.hideCompleted) {
    filteredItems = filteredItems.filter(item => !item.checked);
  }

  if (STORE.searchTerm) {
    filteredItems = STORE.items.filter(item => item.name.includes(STORE.searchTerm));
  }
  
  // at this point, all filtering work has been done (or not done, if that's the current settings), so
  // we send our `filteredItems` into our HTML generation function 
  const shoppingListItemsString = generateShoppingItemsString(filteredItems);

  // insert that HTML into the DOM
  $('.js-shopping-list').html(shoppingListItemsString);
  console.log(filteredItems.length);
}


function addItemToShoppingList(itemName) {
  console.log(`Adding "${itemName}" to shopping list`);
  STORE.items.push({name: itemName, checked: false});
}

function handleNewItemSubmit() {
  $('#js-shopping-list-form').submit(function(event) {
    event.preventDefault();
    console.log('`handleNewItemSubmit` ran');
    const newItemName = $('.js-shopping-list-entry').val();
    $('.js-shopping-list-entry').val('');
    addItemToShoppingList(newItemName);
    renderShoppingList();
  });
}

function toggleCheckedForListItem(itemId) {
  console.log("Toggling checked property for item with id " + itemId);
  const item = STORE.items.find(item => item.id === itemId);
  item.checked = !item.checked;
}


function getItemIdFromElement(item) {
  return $(item)
    .closest('li')
    .data('item-id');
}

function handleItemCheckClicked() {
  $('.js-shopping-list').on('click', `.js-item-toggle`, event => {
    console.log('`handleItemCheckClicked` ran');
    const id = getItemIdFromElement(event.currentTarget);
    toggleCheckedForListItem(id);
    renderShoppingList();
  });
}


// name says it all. responsible for deleting a list item.
function deleteListItem(itemId) {
  console.log(`Deleting item with id  ${itemId} from shopping list`)

  // as with `addItemToShoppingLIst`, this function also has the side effect of
  // mutating the global STORE value.
  //
  // First we find the index of the item with the specified id using the native
  // Array.prototype.findIndex() method. Then we call `.splice` at the index of 
  // the list item we want to remove, with a removeCount of 1.
  const itemIndex = STORE.items.findIndex(item => item.id === itemId);
  STORE.items.splice(itemIndex, 1);
}


function handleDeleteItemClicked() {
  // like in `handleItemCheckClicked`, we use event delegation
  $('.js-shopping-list').on('click', '.js-item-delete', event => {
    console.log('why?');
    // get the index of the item in STORE
    const itemIndex = getItemIdFromElement(event.currentTarget);
    // delete the item
    deleteListItem(itemIndex);
    // render the updated shopping list
    renderShoppingList();
  });
}

// Toggles the STORE.hideCompleted property
function toggleHideFilter() {
  STORE.hideCompleted = !STORE.hideCompleted;
}

// Places an event listener on the checkbox for hiding completed items
function handleToggleHideFilter() {
  $('.js-hide-completed-toggle').on('click', () => {
    toggleHideFilter();
    renderShoppingList();
  });
}

function handleItemEdit() {
  $('.js-shopping-list').on('click', '.js-item-edit', event => {
    console.log('trying to edit');
    const itemIndex = getItemIdFromElement(event.currentTarget);
    console.log("!");
    console.log(itemIndex);
    console.log("!");
    renderEditShoppingList(itemIndex);
    editListItem(itemIndex);
  })
}

function editListItem(itemIndex) {
  $('.js-shopping-list').on('click', '.js-shopping-list-cancel', event => renderShoppingList());
  
 
  const itemIn = STORE.items.findIndex(item => item.id === itemIndex);
  console.log(itemIn);
  console.log("HERE");
  
  $('#js-shopping-list-edit-form').submit(function (event) {
    event.preventDefault();

    const editItem = $('.js-shopping-list-edit').val();
    const foundItem = STORE.items.find(item => item.name === editItem);

    if (!editItem) {
      renderShoppingList()
    } else if (foundItem) {
      alert('This item is already on your shopping list!');
    } else {
      STORE.items[itemIn].name = editItem;
      renderShoppingList();
    };
  });
}

function generateEditItemElement(item) {
  console.log('generateEditItemElement ran');
  
  return `
    <li data-item-id="${item.id}">
      <span class="shopping-item js-shopping-item ${item.checked ? "shopping-item__checked" : ''}">${item.name}</span>
      <div class="shopping-item-controls">
        <form id="js-shopping-list-edit-form">
            <label for="shopping-list-edit">Edit item</label>
            <input type="text" name="shopping-list-edit" class="js-shopping-list-edit" placeholder="e.g., broccoli">
            <button type="submit">Submit edit</button>
        </form>
        <button class="shopping-item-edit-cancel js-shopping-list-cancel">
            <span class="button-label">cancel</span>
        </button>
      </div>
    </li>`;
}

function renderEditShoppingList(item) {
  let filteredItems = STORE.items;

  if (STORE.hideCompleted) {
    filteredItems = filteredItems.filter(item => !item.checked);
  }

  console.log(item + ' to edit');

  const shoppingListItemsString = generateEditShoppingItemsString(item, filteredItems);

  $('.js-shopping-list').html(shoppingListItemsString);
}

function generateEditShoppingItemsString(editItem, shoppingList) {
  console.log("Generating edit shopping list element");
  console.log(shoppingList.length);
  
  const items = shoppingList.map(function(item) {
   
    if(item['id'] === editItem) {
      return generateEditItemElement(item)
    } else {
      return generateItemElement(item)};
  });

  console.log('past checking');
  return items.join("");
}

function handleItemSearch() {
  clearItemSearch();

  $('.js-shopping-list-search-entry').on('keyup', function(event) {
    console.log('hi');
    const searchVal = $(event.currentTarget).val();
    console.log(searchVal);
    setSearchTerm(searchVal);

    renderShoppingList();
  });
}

function setSearchTerm(value) {
  STORE.searchTerm = value;
}

function clearItemSearch() {
  $('#js-shopping-list-search-form').submit(function(event) {
    event.preventDefault;
    event.currentTarget.reset();
  })
}

// this function will be our callback when the page loads. it's responsible for
// initially rendering the shopping list, and activating our individual functions
// that handle new item submission and user clicks on the "check" and "delete" buttons
// for individual shopping list items.
function handleShoppingList() {
  renderShoppingList();
  handleNewItemSubmit();
  handleItemCheckClicked();
  handleDeleteItemClicked();
  handleToggleHideFilter();
  handleItemEdit();
  handleItemSearch();
}

// when the page loads, call `handleShoppingList`
$(handleShoppingList);
