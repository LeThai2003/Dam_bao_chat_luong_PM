// Show Alert
const showAlert = document.querySelector("[show-alert]");
if(showAlert) {
  const time = parseInt(showAlert.getAttribute("data-time"));
  setTimeout(() => {
    showAlert.classList.add("alert-hidden");
  }, time);

  const closeAlert = showAlert.querySelector("[close-alert]");
  closeAlert.addEventListener("click", () => {
    showAlert.classList.add("alert-hidden");
  });
}
// End Show Alert

// table-cart
const tableCart = document.querySelector("[table-cart]");
if(tableCart) {
  const inputsQuantity = tableCart.querySelectorAll("input[name='quantity']");

  inputsQuantity.forEach(input => {
    input.addEventListener("change", () => {
      const productId = input.getAttribute("item-id");
      const quantity = input.value;

      if(quantity){
        window.location.href = `/cart/update/${productId}/${quantity}`;
      }

    });
  });
}
// End table-cart


// search
const formSearch = document.querySelector('#form-search');
if(formSearch)
{
  const inputSearch = formSearch.querySelector("input");
  const buttonSubmit = formSearch.querySelector("button");
  let url = new URL(window.location.href);

  buttonSubmit.addEventListener("click", () => {
    if(inputSearch.value)
    {
      url.searchParams.set("keyword", inputSearch.value);
      window.location.href = url.href;
    }
  })
}
// end search

// sort
const sort = document.querySelector("[sort]");
if(sort) {
  let url = new URL(window.location.href);

  const sortSelect = sort.querySelector("[sort-select]");
  const sortClear = sort.querySelector("[sort-clear]");

  // Sắp xếp
  sortSelect.addEventListener("change", () => {
    const [sortKey, sortValue] = sortSelect.value.split("-");

    url.searchParams.set("sortKey", sortKey);
    url.searchParams.set("sortValue", sortValue);

    window.location.href = url.href;
  });

  // Xóa sắp xếp
  sortClear.addEventListener("click", () => {
    url.searchParams.delete("sortKey");
    url.searchParams.delete("sortValue");

    window.location.href = url.href;
  });

  // Thêm selected cho option
  const sortKey = url.searchParams.get("sortKey");
  const sortValue = url.searchParams.get("sortValue");

  if(sortKey && sortValue) {
    const string = `${sortKey}-${sortValue}`;
    const optionSelected = sortSelect.querySelector(`option[value="${string}"]`);
    optionSelected.selected = true;
    // optionSelected.setAttribute("selected", true);
  }
}
// end sort

// Pagination
const buttonsPagination = document.querySelectorAll("[button-pagination]");
if (buttonsPagination.length > 0) {
  let url = new URL(window.location.href);

  buttonsPagination.forEach((button) => {
    button.addEventListener("click", () => {
      const page = button.getAttribute("button-pagination");

      url.searchParams.set("page", page);

      window.location.href = url.href;
    });
  });
}
// End Pagination

// Preview Image
const uploadImage = document.querySelector("[upload-image]");
if(uploadImage) {
  const uploadImageInput = uploadImage.querySelector("[upload-image-input]");
  const uploadImagePreview = uploadImage.querySelector("[upload-image-preview]");

  uploadImageInput.addEventListener("change", (event) => {
    const [file] = uploadImageInput.files;
    if (file) {
      uploadImagePreview.src = URL.createObjectURL(file);
    }
  });
}
// End Preview Image

// Orders table
const tableOrders = document.querySelectorAll('table[table-orders]');
if(tableOrders.length > 0)
{
  tableOrders.forEach(table => {
    const rows = table.querySelectorAll('tr');
    rows.forEach(row =>
      row.addEventListener("click", () => {
        const orderId = row.getAttribute("orderId");
        window.location.href = `/orders/detail/${orderId}`;
      })
    )
  })
}
// End orders table


// Button cancle order
const buttonCancleOrder = document.querySelector("button[button-cancle-order]");
if(buttonCancleOrder)
{
  const formCancleOrder = document.querySelector("form[form-cancle-order]");
  console.log(formCancleOrder);
  if(formCancleOrder)
  {
    buttonCancleOrder.addEventListener("click", () => {
      formCancleOrder.submit();
    })
  }
}
// End button cancle order

// form checkout cart
const buttonCheckout = document.querySelector("a[button-checkout]");
if(buttonCheckout){
  console.log(buttonCheckout);
  buttonCheckout.addEventListener("click", () => {
    const formCheckoutCart = document.querySelector("form[form-checkout-cart]");
    const tableCartBody = document.querySelector("table[table-cart] tbody");
    if(formCheckoutCart && tableCart){
      const rows = tableCartBody.querySelectorAll("tr");
      const data = [];
      rows.forEach(row => {
        console.log(row);
        const inputQuantity = row.querySelector('input[name="quantity"]');
        const productId = inputQuantity.getAttribute("item-id");
        const quantity = inputQuantity.getAttribute("value");
        const dataItem = productId + "-" + quantity;
        data.push(dataItem);
      });
      
      const inputData = formCheckoutCart.querySelector('input[name="data"]');
      inputData.value = data;

      formCheckoutCart.submit();      
    }
  })
}
// end form checkout cart