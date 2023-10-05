const userHelpers = require("../helpers/user-helpers");
const categoryHelpers=require("../helpers/category-helper")
const BrandHelpers=require("../helpers/Brandhelpers");
const productHelpers = require("../helpers/product-helpers");
const cartHelpers=require("../helpers/cart-helpers");
const orderHelpers=require("../helpers/order-helpers")
const bannerHelpers=require("../helpers/bannerhelpers")
const wishlistHelpers=require("../helpers/wishlist-helpers")
const { ObjectId } = require("mongodb-legacy");
const bcrypt = require('bcrypt');
const cloudinary=require('../util/cloudinary');
const coupenHelpers = require("../helpers/coupen-helpers");
const RazorpayHelpers=require("../helpers/razorpay-helpers");
const walletHelpers=require("../helpers/wallet-helpers")
const { response } = require("express");

module.exports={
  userviewrender:async(req,res,next)=>{
    try{
        const homeclass="active" 
        let user=req.session.user
        let userName = req.session.userName;
        //cart count---------------------------------
        let cartcount=null
        if(userName){
        cartcount=await cartHelpers.getcartcount(req.session.userId)
        }
        //-------------cartcount-----------------------------------
        let banners=await bannerHelpers.findOne()
        // let latestproduct=await productHelpers.latestproduct()
        res.render('user/userview',{user,userName,cartcount,banners,homeclass});
    }catch(err){
      console.log(err);
    }
  },



  renderusersignup:(req,res)=>{
      try{
        if(req.session.loggedIn==true){
           res.redirect('/')
        }else{
           res.render('user/usersignup',{signupErr:req.session.signupErr});
           req.session.signupErr=false
        }
      }catch(err){
        console.log(err);
      }

  },



  renderuserlogin:(req,res)=>{
     try{
        if(req.session.loggedIn){
           res.redirect('/')
        }else{
           res.render('user/userlogin',{loginErr:req.session.loginErr})
           req.session.loginErr=false;
        }
      }catch(err){
        console.log(err);
      }
  },



  signuppost:async(req,res)=>{
    try{
      let email=req.body.email
      let phone=req.body.Phonenumber
      let emailexist=await userHelpers.emailexist(email)
      let phoneexist=await userHelpers.phonenumberexist(phone)
      if(emailexist||phoneexist){
        req.session.signupErr='invalid email or phonenumber'
        res.redirect("/signup")
      }else{
      userHelpers.dosignup(req.body).then((response)=>{
      req.session.userId=response._id
      req.session.loggedIn=true;
      req.session.user=response;
      req.session.userName=response.name;
      res.redirect('/');
      })
    }
    }catch(err){
      console.log(err);
    }
  },


  loginpost:(req,res)=>{
     try{
         userHelpers.dologin(req.body).then((response)=>{
         if(response.status){
         req.session.loggedIn=true;
         req.session.userId=response.user._id
         console.log(req.session.userId);
         req.session.user=response;
         req.session.userName=response.user.name;
         res.redirect('/')
         }else{
         req.session.loginErr='invalid username or password'
         res.redirect('/login')
        }
        })
      }catch(err){
        console.log(err);
      }
  },


  logout:(req,res)=>{
    try{
      req.session.destroy();
      res.redirect('/');
    }catch(err){
      console.log(err);
    }
  },


  rendershopepage:async(req,res,next)=>{
    try{
      const shopeclass="active"
      let  userName=req.session. userName
      const brandId=req.query.brandId
      const categoryId=req.query.categoryId
      const minamout=req.query.min
      const maxamount=req.query.max
      const search=req.query.search

      let page=req.query.page||1
      let limit=6
      let skip=(page-1)*limit
      let currentpage=parseInt(page)
      let totalproduct= await productHelpers.totalproduct()
      let totalpage=Math.ceil(totalproduct/limit)
      totalpage=parseInt(totalpage)

        if(search){
          let products=await productHelpers.findsearchproducts(search)
          for(let i=0;i<products.length;i++){
            products[i].price=products[i].price.toLocaleString('en-IN', { style: "currency", currency: "INR" })
          }
          let categories=await categoryHelpers.listedcategory()
          let brands= await BrandHelpers.findlistedbrand()
          //cart count---------------------------------
          let cartcount=null
          if(userName){
          cartcount=await cartHelpers.getcartcount(req.session.userId)
          }
          //-------------cartcount-----------------------------------
          res.render("user/shop",{products,categories,brands, userName,cartcount,totalpage,currentpage,shopeclass})
        }

       else if(minamout&&maxamount){
          let products=await productHelpers.findfilterproduct(minamout,maxamount)
          for(let i=0;i<products.length;i++){
          products[i].price=products[i].price.toLocaleString('en-IN', { style: "currency", currency: "INR" })
        }
        let categories=await categoryHelpers.listedcategory()
        let brands= await BrandHelpers.findlistedbrand()
        //cart count---------------------------------
        let cartcount=null
        if(userName){
        cartcount=await cartHelpers.getcartcount(req.session.userId)
        }
        //-------------cartcount-----------------------------------
        res.render("user/shop",{products,categories,brands, userName,cartcount,totalpage,currentpage,shopeclass})
       }
      
      else if(categoryId){
            let products=await  productHelpers.findcategoryproduct(categoryId)
            for(let i=0;i<products.length;i++){
              products[i].price=products[i].price.toLocaleString('en-IN', { style: "currency", currency: "INR" })
            }
              let categories=await categoryHelpers.listedcategory()
              let brands= await BrandHelpers.findlistedbrand()
              //cart count---------------------------------
              let cartcount=null
              if(userName){
              cartcount=await cartHelpers.getcartcount(req.session.userId)
              }
              //-------------cartcount-----------------------------------
              // console.log(products);
              res.render("user/shop",{products,categories,brands, userName,cartcount,totalpage,currentpage,shopeclass})
      }else if(brandId){
              let products=await productHelpers.findbrandproduct(brandId)
              for(let i=0;i<products.length;i++){
                products[i].price=products[i].price.toLocaleString('en-IN', { style: "currency", currency: "INR" })
              }
              let categories=await categoryHelpers.listedcategory()
              let brands= await BrandHelpers.findlistedbrand()
              //cart count---------------------------------
              let cartcount=null
              if(userName){
              cartcount=await cartHelpers.getcartcount(req.session.userId)
              }
              //-------------cartcount-----------------------------------
              
              res.render("user/shop",{products,categories,brands, userName,cartcount,totalpage,currentpage,shopeclass})

      }else{
       
              let products=await userHelpers.findAll(skip,limit)
              for(let i=0;i<products.length;i++){
                products[i].price=products[i].price.toLocaleString('en-IN', { style: "currency", currency: "INR" })
              }
              let categories=await categoryHelpers.listedcategory()
              let brands= await BrandHelpers.findlistedbrand()
              //cart count---------------------------------
              let cartcount=null
              if(userName){
              cartcount=await cartHelpers.getcartcount(req.session.userId)
              }
              //-------------cartcount-----------------------------------
              res.render("user/shop",{products,categories,brands,userName,cartcount,totalpage,currentpage,shopeclass})
       }
      }catch(err){
        console.log(err);
        next(err)
      }
  },



  renderproductdetail:async(req,res,next)=>{
   try{
         let  userName=req.session. userName
         const productId=req.params.id
         const product=await productHelpers.findsingleproductdata(productId)
         product[0].price=product[0].price.toLocaleString('en-IN', { style: "currency", currency: "INR" })
         //cart count---------------------------------
         let cartcount=null
         if(userName){
         cartcount=await cartHelpers.getcartcount(req.session.userId)
         }
         //-------------cartcount-----------------------------------
         res.render('user/productdetails',{product, userName,cartcount})
      }catch(err){
        console.log(err);
        next(err)
      }
  },

rendercartpage:async(req,res)=>{
  try{
      let  userName=req.session. userName
      let userId= new ObjectId(req.session.userId)
      const cart=await cartHelpers.getcart(userId)
      let totalprice=0
      for(let i=0;i<cart.length;i++){
      totalprice=totalprice+cart[i].subTotal
      cart[i].productdetails.price= cart[i].productdetails.price.toLocaleString('en-IN', { style: "currency", currency: "INR" })
      cart[i].subTotal= cart[i].subTotal.toLocaleString('en-IN', { style: "currency", currency: "INR" })
      }
      totalprice=totalprice.toLocaleString('en-IN', { style: "currency", currency: "INR" })
      //cart count---------------------------------
      let cartcount=null
      if(userName){
      cartcount=await cartHelpers.getcartcount(req.session.userId)
      }
      //-------------cartcount-----------------------------------

      res.render("user/cart-page",{userName,cart,totalprice,cartcount})
    }catch(err){
      console.log(err);
    }
},


addtocart:async(req,res,next)=>{
  try{
       const productId=req.params.id
       const userId= new ObjectId(req.session.userId)
       const iscartexist=await cartHelpers.findcart(userId)
      if(iscartexist){
      let updatecart=  await cartHelpers.updatecart(userId,productId)
       if(updatecart=="success"){
        res.json({
          status:"success",
          message:"added to cart"
        })
        }else{
        res.json({
          status:"failed",
          message:"out of stock"
        })
        }
      }else{
       await cartHelpers.addtocart(userId,productId)
       res.json({
        status:"success",
        message:"added to cart"
      })
      }  
    }catch(err){
      console.log(err);
      next(err)
    }
},


renderotppage:(req,res)=>{
  try{
    let errormsg=req.query.message ?? ""
     res.render("user/otpverification",{errormsg})
  }catch(err){
    console.log(err);
  }
},


otppost:async(req,res)=>{
   try{
      let otpdetails=req.body.number
      const isalreadyexist=await userHelpers.phonenumberexist(otpdetails)
      if(isalreadyexist){
      req.session.loggedIn=true;
      req.session.userId=isalreadyexist._id
      req.session.user=isalreadyexist
      req.session.userName=isalreadyexist.name;
      res.redirect('/')
      }else{
      res.redirect('/OTP-login?message=is already exist')
      }
   }catch(err){
     console.log(err);
   }
},


changeproductquantity:async(req,res)=>{
   try{
      let{cartId,proId,count}=req.body
      const changequantity=await cartHelpers.changecartproductquantity(cartId,proId,count)
      if(changequantity. modifiedCount===1){
      res.json({
       status:"removed",
       message:"item removed"
      })
      }else{
      res.json({
        status:"changed",
        message:"product quantity changed"
      })
      }
    }catch(err){
      console.log(err);
    }

},


removecart:async(req,res,next)=>{
   try{
      const productId=req.params.id
      const userId=req.session.userId
      await cartHelpers.removecartproduct(userId,productId)
      res.redirect("/cart")
    }catch(err){
      console.log(err);
      next(err)
    }
},


rendercheckoutpage:async(req,res)=>{
   try{
      let  userName=req.session. userName
      const userId=new ObjectId(req.session.userId)
      const cartproductdetails=await cartHelpers.getcart(userId)
      let totalprice=0
      for(let i=0;i<cartproductdetails.length;i++){
      totalprice=totalprice+cartproductdetails[i].subTotal
      cartproductdetails[i].productdetails.price=cartproductdetails[i].productdetails.price.toLocaleString('en-IN', { style: "currency", currency: "INR" })
      cartproductdetails[i].subTotal= cartproductdetails[i].subTotal.toLocaleString('en-IN', { style: "currency", currency: "INR" })
      }
      totalprice=totalprice.toLocaleString('en-IN', { style: "currency", currency: "INR" })
      let user=await userHelpers.findaddress(req.session.userId)
      //cart count---------------------------------
      let cartcount=null
      if(userName){
      cartcount=await cartHelpers.getcartcount(req.session.userId)
      }
      //-------------cartcount-----------------------------------
      res.render("user/checkout",{userName,cartproductdetails,totalprice,user,cartcount})
    }catch(err){
      console.log(err);
    }
},


addaddress:async(req,res)=>{
  try{
     const address=req.body
     const userId=req.session.userId
     await userHelpers.addaddrtess(address,userId)
     res.redirect("/checkout")
  }catch(err){
    console.log(err);
  }
},


addnewaddress:async(req,res)=>{
  try{
    const address=req.body
    const userId=req.session.userId
    await userHelpers.addaddrtess(address,userId)
    res.redirect("/profile")
  }catch(err){
    console.log(err);
  }
},


editaddress:async(req,res,next)=>{
  try{
    const addressId=req.params.id
    const userId=req.session.userId
    await userHelpers.editaddress(addressId,userId,req.body)
    res.redirect("/profile")
  }catch(err){
    console.log(err);
    next(err)
  }

},


deleteaddress:async(req,res,next)=>{
  try{
    const addressId=req.params.id
    const userId=req.session.userId
    await userHelpers.deleteaddress(addressId,userId)
    res.redirect("/profile")
  }catch(err){
    console.log(err);
    next(err)
  }
},

orderdetais:async(req,res)=>{
  try{
    let{products,addressid,paymentMethod,total,coupencode,offer}=req.body
    offer=offer.replace(/,/g,"")
    offer=offer.replace('₹','')
    offer= parseInt(offer)
    let userId=req.session.userId
    let cart= await cartHelpers.findusercart(userId)
    var outofstock=false;
    cart.forEach(cart=>{
      if(cart.products.quantity>cart.productdetails.quantity){
        outofstock=true
        outofstockproduct=cart.productdetails.productname
        productquantity=cart.productdetails.quantity
      }
    })
    if(outofstock){
      res.json({
        status:"out-of-stock",
        product:outofstockproduct,
        quantity:productquantity
      })
    }else{
  
    let address=await userHelpers.findOneaddress(userId,addressid)
    userId=new ObjectId(userId)
    address=address[0].address
    
   for(let i=0;i<products.length;i++){
    products[i].productid=new ObjectId( products[i].productid)
    products[i].quantity=Number(products[i].quantity)
   }
    let status
    if(paymentMethod==='COD'){
     status="PLACED"
    }else{
      status="Pending"
    }
    const date = new Date()
    let result=await orderHelpers.insertorderdata(products,address,userId,status,date,total,paymentMethod,offer)
      const orderId=result.insertedId
      if(paymentMethod=="COD"){
      await cartHelpers.deletecart(userId)
      await coupenHelpers.adduser(coupencode,userId)

      products.forEach(async(product)=>{
        product.quantity=product.quantity*-1
       await productHelpers.changestock(product.productid,product.quantity)
      });
        res.json({
          status:"success",
          message:"order placed"
        })
        
      }else if(paymentMethod=="online"){
      
           total=total.replace(/,/g,"")
           total=total.replace('₹','')
           total = parseInt(total)
       let onlineresult= await RazorpayHelpers.generaterazorpay(orderId,total)
       res.json({onlineresult,coupencode})
        if(onlineresult){
          console.log(onlineresult);
        }

        
      }else if(paymentMethod=="wallet"){
        total=total.replace(/,/g,"")
        total=total.replace('₹','')
        total = parseInt(total)
        let walletamount=await walletHelpers.findamount(userId)
        console.log(walletamount);
        if(walletamount){
        walletamount=parseInt(walletamount.amount)
        if(total>walletamount){
          res.json({
            status:"failed",
            message:"order placed"
          })
        }else{
        await cartHelpers.deletecart(userId)
        if(coupencode){
         await coupenHelpers.adduser(coupencode,userId)
        }
      products.forEach(async(product)=>{
        product.quantity=product.quantity*-1
       await productHelpers.changestock(product.productid,product.quantity)
      });
      await orderHelpers.changepaymentstatus(orderId)
        // update wallet
        let amount = total*-1
        await walletHelpers.updateWallet(userId,amount)
        res.json({
          status:"success",
          message:"order placed"
        })

      }
      }else{
        res.json({
          status:"failed",
          message:"order placed"
        })
      }
    }
    }
    }catch(err){
      console.log(err);
    } 
},


 renderorderpage:async(req,res)=>{
     try{
         const orderclass="active"
         let  userName=req.session. userName
         //cart count---------------------------------
         let cartcount=null
         if(userName){
         cartcount=await cartHelpers.getcartcount(req.session.userId)
         }
         //-------------cartcount-----------------------------------
         let userId=new ObjectId(req.session.userId)
         let orders= await orderHelpers.getorderdetails(userId)
         for(let i=0;i<orders.length;i++){
         orders[i].date=orders[i].date.toLocaleString({timeZone: 'Asia/Kolkata'});
         }
         res.render("user/orders",{orders,userName,cartcount,orderclass})
      }catch(err){
        console.log(err);
      }
 },


  renderorderdetailspage:async(req,res,next)=>{
    try{
          const orderId=new ObjectId(req.params.id)
          let orderdetails=await orderHelpers.Findalldetails(orderId)
          //-------------------------------------
          // let totalprice=0
        for(let i=0;i<orderdetails.length;i++){
            // totalprice=totalprice+orderdetails[i].subTotal
            orderdetails[i].productdetails.price=orderdetails[i].productdetails.price.toLocaleString('en-IN', { style: "currency", currency: "INR" })
            orderdetails[i].subTotal= orderdetails[i].subTotal.toLocaleString('en-IN', { style: "currency", currency: "INR" })
            orderdetails[i].date=orderdetails[i].date.toLocaleString({timeZone: 'Asia/Kolkata'});
            orderdetails[i].offer=orderdetails[i].offer.toLocaleString('en-IN', { style: "currency", currency: "INR" })
            orderdetails[i].total=orderdetails[i].total.toLocaleString('en-IN', { style: "currency", currency: "INR" })
        }
            // totalprice=totalprice.toLocaleString('en-IN', { style: "currency", currency: "INR" })
          //-------------------------------------
            let  userName=req.session. userName
           //cart count---------------------------------
            let cartcount=null
        if(userName){
            cartcount=await cartHelpers.getcartcount(req.session.userId)
        }
           //-------------cartcount-----------------------------------
           res.render("user/orderdetails",{orderdetails,userName,cartcount})
     }catch(err){
          console.log(err);
          next(err)
     }
  },

  rendersuccesspage:(req,res)=>{
   try{
      let  userName=req.session. userName
      res.render("user/success",{userName})
     }catch(err){
        console.log(err);
   }
  },

  renderprofilepage:async(req,res)=>{
    try{
        const accountclass="active"
        let  userName=req.session. userName
        let userId=req.session.userId
        let userdetails=await userHelpers.finduser(userId)
        res.render("user/userprofile",{userdetails,userName,accountclass})
      }catch(err){
        console.log(err);
      }
  },

  renderwishlist:async(req,res)=>{
    try{
      let  userName=req.session. userName
      let userId=new ObjectId(req.session.userId)
      let wishlist=await wishlistHelpers.FindAll(userId)
      for(let i=0;i<wishlist.length;i++){
      wishlist[i].productdetails.price=wishlist[i].productdetails.price.toLocaleString('en-IN', { style: "currency", currency: "INR" })
      }
       res.render("user/wishlist",{wishlist,userName})
    }catch(err){
      console.log(err);
    }
  },


  addtowishlist:async(req,res,next)=>{
    try{
      const proId= new ObjectId(req.params.id)
      const userId=new ObjectId(req.session.userId)
      const isalreadyExist=await wishlistHelpers.finduser(userId)
      if(isalreadyExist){
      let result=  await wishlistHelpers.updatewishlist(proId,userId)
         if(result=="success"){
           res.json({
            status:"success",
            message:"added to wish list"
           })
         }else{
          res.json({
          status:"Removed",
          message:"Removed From wish list"
          })
         }
      }else{
        await wishlistHelpers.addtowishlist(proId,userId)
        res.json({
         status:"success",
         message:"added to wishlist"
       })
      }
    }catch(err){
      console.log(err);
      next(err)
    }

  },


  renderRewards:async(req,res)=>{
    try{
      const accountclass="active"
      let  userName=req.session. userName
      let userId=req.session.userId
      await coupenHelpers.checkCouponExpired()
      const rewards=await coupenHelpers.FindAll(userId)
      res.render("user/Rewards",{rewards,userName,accountclass})
    }catch(err){
      console.log(err);
    }
  },

  applycoupen:async(req,res)=>{
    try{
       const userId=req.session.userId
       const{coupencode}=req.body
       const coupen=await coupenHelpers.findOne(coupencode)
      if(!coupen){
         res.json({
              status:"Nocoupen"
        })
      }else if(coupen.expiryDate<new Date()||coupen.isExpired){
          res.json({
               status:"Expired"
             })
      }else{
            const isUsedcoupen=await coupenHelpers.checkUsedCoupon(userId,coupencode)
            if(isUsedcoupen){
                  res.json({
                      status:"already used"
                    })
            }else{
                 res.json({
                   status:"success",
                   percentage:coupen.discount
                 })
            }
      }
    }catch(err){
      console.log(err);
    }
   
  },


  verifypayment:async(req,res)=>{
    try{
      let userId= new ObjectId(req.session.userId)
      const successfull= RazorpayHelpers.verifypayment(req.body)
        if(successfull){
             // change stock
             let cart= await cartHelpers.getcart(userId)
             cart.forEach(async(cart)=>{
             cart.products.quantity=cart.products.quantity *-1
             await productHelpers.changestock(cart.products.productId,cart.products.quantity)
             });
           // change stock
          await orderHelpers.changepaymentstatus(req.body.order.receipt)
          await cartHelpers.deletecart(userId)
          await coupenHelpers.adduser(req.body.coupencode,userId)
          // console.log("success full");
            res.json({
              status:true
            })
        }else{
            res.json({
              status:false
            })
          //  console.log("payment failed");
        }
      }catch(err){
        console.log(err);
      }
  },


  
  changepassword:async(req,res)=>{
    try{
       let UserId=req.session.userId
       let{currentpassword, newpassword}=req.body
       const user=await userHelpers.finduser(UserId)
       const ispasswordiscorrect=await bcrypt.compare(currentpassword,user.password)
      if(ispasswordiscorrect){
       await userHelpers.changepassword(UserId,newpassword)
           res.json({
             status:"success",
             message:"password changed"
           })
      }else{
           res.json({
             status:"failed",
             message:"password not match"
           })
      }
      }catch(err){
        console.log(err);
      }
  },



  editprofile:async(req,res)=>{
    try{
        const userId=req.session.userId
        let{name,email,phone}=req.body
        let user=await userHelpers.finduser(userId)
        if(user.name==name&&user.email==email&&user.Phonenumber==phone){
            res.json({
              status:false,
              message:"No changes"
             })
          }else{
    let phonenumberExist=await userHelpers.phonenumberexist(phone)
    // let emailexist=await userHelpers.emailexist(email)
        if(phonenumberExist){
        if(phonenumberExist.Phonenumber==user.Phonenumber){
        await userHelpers.updateProfile(name,user.Phonenumber,email,userId)
            res.json({
             status:true,
             message:'profile updated'
            })
          }else{
            res.json({
              status:false,
              message:'phone number already exist'
             })
          }
          }else{
        await userHelpers.updateProfile(name,phone,email,userId)
            res.json({
             status:true,
             message:'profile updated'
            })
          }
          }
      }catch(err){
        console.log(err);
      }
   
  },



  renderwallet:async(req,res)=>{
    try{
          const accountclass="active"
          let userName=req.session.userName
          let userId=req.session.userId
          userId=new ObjectId(userId)
          let walletamount=await walletHelpers.getuserwallet(userId)
          if(walletamount){
          walletamount=walletamount.amount.toLocaleString('en-IN', { style: "currency", currency: "INR" })
          }
          res.render("user/wallet",{walletamount,userName,accountclass})
    }catch(err){
      console.log(err);
    }
  },
  changeorderstatus:async(req,res)=>{
    try{
        console.log("hiiiiiiiiiiiiiiiiiiiii");
        let {orderId,status}=req.body
        console.log(status);
        console.log(orderId);
          if(status=="cancelled"){
                let order=await orderHelpers.Findalldetails(new ObjectId(orderId))
                order.forEach(async(order)=>{
                await productHelpers.changestock(order.products.productid,order.products.quantity)
                });
                await orderHelpers.changeorderstatus(orderId,status)
                res.json({
                status:"status changed"
                })

            }else if(status=="returned"){
                let order=await orderHelpers.Findalldetails(new ObjectId(orderId))
                order.forEach(async(order)=>{
                    await productHelpers.changestock(order.products.productid,order.products.quantity)
                    });
                    await orderHelpers.changeorderstatus(orderId,status)
                    await orderHelpers.changepaystatus(orderId)
                    res.json({
                    status:"status changed"
                    })
            
            }else{
                await orderHelpers.changeorderstatus(orderId,status)
                res.json({
                    status:"status changed"
                })
            }
            

    }catch(err){
        console.log(err);
    }
},






    
}