const client = contentful.createClient({
  space: 'b6o1t5o9di7c',
  accessToken: 'claywbTE2U7GSZ8chuac4udP3pocVkRDd8WJ35d628w'
})

const navCartSelector = document.querySelector('.cart')
const totalQuantities = document.querySelector('.total')
const itemContainer = document.querySelector('.item-container')
const overlaySelector = document.querySelector('.overlay')
const cartContainerSelector = document.querySelector('.cart-container')
const closeButton = document.querySelector('.fa-window-close')
const cartItems = document.querySelector('.cart-items')
const totalAmount = document.querySelector('.total-amount')
const clearCartBtn = document.querySelector('.clear-cart')

let cart = [];
let totalProducts = [];
let bagButtons = [];
class Products{
  async getProducts() {
    let products = await client.getEntries({
      content_type: 'comfyHouseProduct'
    })
    products = products.items.map(item => {
      const { id } = item.sys
      const { title, price } = item.fields
      const image = item.fields.image.fields.file.url
      return {
        id, title, price, image
      }
    })
    return products
  }
}

class UI {


  initiate(products) {
    totalProducts = products
    cart = Storage.getItems() === null ? [] : [...Storage.getItems()] 
    this.cartContainerUI()
    this.performCartCalculation()
    this.cartLogic()
  }

  renderProducts(products) {
    
    products.map(product => {
      itemContainer.innerHTML += 
        `<div class="item">
        <img src=${product.image} alt="product">
        <div class="decription">
          <h4 class="title">${product.title}</h4>
          <div class="price">$${product.price}</div>
        </div>
          <button  data-id = ${product.id}>
            <i class="fas fa-shopping-cart"></i>
            <span>Add to Cart</span>
          </button>
      </div>`  
    })

    bagButtons = [...document.querySelectorAll('.item button')]
    this.updateCartCondition()
    bagButtons.forEach((button) => {
      if (this.isTheItemInCart(button.dataset.id)) {
          this.renderCartItem(button.dataset.id)
      }
    })
  }

  cartContainerUI() {
    navCartSelector.addEventListener('click',this.toggleCart)
    closeButton.addEventListener('click', this.toggleCart)
  }

  toggleCart() {
    overlaySelector.classList.toggle('translate')
    cartContainerSelector.classList.toggle('translate')
  }


  updateBagButtons() {  
    
    bagButtons.forEach(button => {
      // Adding Buttons to cart
      button.addEventListener('click', () => {
        this.addToCart(button.dataset.id)
        this.updateCartCondition()
      })
    })
  } 
  updateCartCondition() {
    bagButtons.forEach(button => {
      if(cart[0] === undefined)cart = []
      let isInCart = this.isTheItemInCart(button.dataset.id)
      if (isInCart) {
        button.innerHTML = 'In Cart'
        button.disabled = true
      }
      else {
        button.innerHTML =
          `<i class="fas fa-shopping-cart"></i>
            <span>Add to Cart</span>`
        button.disabled = false
      }
    })
  }

  isTheItemInCart(id) {
    return cart.some(item =>id === item.id)
  }
  
  addToCart(id) {
    let itemToAdd = totalProducts.find(product => product.id === id)
    cart.push({...itemToAdd, quantity: 1})
    Storage.saveCart()
    this.renderCartItem(id)
    this.performCartCalculation()
    this.toggleCart()
  }

  
  cartLogic() {
    
    // Clear The Cart
    clearCartBtn.addEventListener('click', () => {
      this.clearCart()
    })

    cartItems.addEventListener('click', (e) => {
      if (e.target.textContent === 'Remove') {
        let itemToRemove = e.target
        this.removeItem(itemToRemove.dataset.id)
        this.updateCartCondition() 
        itemToRemove.parentElement.parentElement.remove()
      }

      if (e.target.classList.contains('fa-sort-up')) {
        let total;
        cart = cart.map(item => {
          if (item.id === e.target.dataset.id) {
            item.quantity++;
            total = item.quantity;
            Storage.saveCart()
            this.performCartCalculation()
          }
          return item;
        })
        e.target.nextElementSibling.innerText = total;
          
      }

      if (e.target.classList.contains('fa-sort-down')) {
        let total;
        cart = cart.map(item => {
          if (item.id === e.target.dataset.id) {
            item.quantity--;
            total = item.quantity;
            Storage.saveCart()
            this.performCartCalculation()
          }
          return item;
        })
        if (total === 0) {
          this.removeItem(e.target.dataset.id)
          this.updateCartCondition()
          e.target.parentElement.parentElement.remove()
        }
        else {
          e.target.previousElementSibling.innerText = total;
        }
          
      }
    })
    
  }

  clearCart(){
    cart = cart.map(item => this.removeItem(item.id))
    this.updateCartCondition()
    cartItems.innerHTML = ``
  }

  

  removeItem(id) {
    cart = cart.filter(item => item.id !== id)
    Storage.saveCart()
    this.performCartCalculation()
  }
   

  renderCartItem(id) {
    let product = cart.find(item => item.id === id)
    cartItems.innerHTML += `
      <div class="cart-item"  data-id = ${product.id}>
        <img src=${product.image} alt="in cart">
        <div class="description">
          <h4>${product.title}</h4>
          <div class="price">$${product.price}</div>
          <a  data-id = ${product.id}>Remove</a>
        </div>
        <div class="quantity">
          <i class="fas fa-sort-up" data-id = ${product.id}></i>
          <span class="total-quantity">${product.quantity}</span>
          <i class="fas fa-sort-down"
          data-id = ${product.id}
          ></i>
        </div>
      </div>
    `
  }

  performCartCalculation() {
    let totalCost = cart.reduce((acc, item) => {
      return   acc + item.quantity * item.price
    }, 0)
    let totalQuantity = cart.reduce((acc, item)=>acc + item.quantity, 0)
    totalAmount.innerText = `$${totalCost.toFixed(2)}`
    totalQuantities.innerText = `${totalQuantity}`
  }

}

class Storage{
  static saveCart() {
    console.log('Hi')
    localStorage.setItem('cart', JSON.stringify(cart))
  }

  static getItems(){
    return JSON.parse(localStorage.getItem('cart'))
  }
}

window.addEventListener('DOMContentLoaded', () => {
  let products = new Products()
  let ui = new UI()
  products.getProducts()
    .then(products => {
      ui.initiate(products)
      ui.renderProducts(products)
      ui.updateBagButtons(products)
  })
  
})
