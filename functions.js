/******************************************************************************/
/*********************common functions*****************************************/

// Function to load the form details
function load(process_num) {
  var configData_notJSON = JSON.parse(config_data);
  var process = configData_notJSON[0]['process'+process_num];
  return process;
}

//create the forms based on the loaded data
function create_form(process_num, form_num, default_values) {
  var process = load(process_num);

  if(!('form'+form_num in process)) {
      form_num = 1;
  }

  var fields = process['form'+form_num].fields;

//creating a form element
  var f = document.createElement("form");
  f.setAttribute('name','form'+form_num);
  f.setAttribute('id', 'form'+form_num);

  var heading = document.createElement("div");
  heading.innerHTML = process['form'+form_num].heading;
  f.appendChild(heading);
  
  //adding all the input fields to the form element created
  var i;
  for (var index = 0; index < fields.length; index++) {
      addField(process_num, f, fields[index], default_values);
  }

//adding the form element after the div in the mail hmtl
  document.getElementById('task'+process_num).appendChild(f);

}

//add each input field to the form. 
//input field details taken from the config file loaded initially.
function addField(process_num, f, field, default_values) {
      var li = document.createElement("span");
      li.innerHTML = field.label;
      
      if('conditional' in field && field.conditional) {
          if(default_values['condition']) {
            if(field.values!="") {
                //populating the conditional fields usoing the conditional array config (processConditional<process_num>)
                conditionalFields(f, field.values);
            } else {
                //adding the field as it is
                field.conditional = false;//setting the conditional property to false to avoid infinite loop
                addField(process_num, f, field, default_values)
            }
          } else {
            return;
        }
      } else {
          if (field.type=='list') {
            i = document.createElement("UL");
            i.name = field.name;
            i.id = field.id;
            i.className = "guest-list";
            var list_elements = field.values;
            var node, textnode;
            for(var sub_index=0;sub_index<list_elements.length;sub_index++) {
                node = document.createElement("LI");
                textnode = document.createTextNode(list_elements[sub_index]);
                node.appendChild(textnode);
                fn = field.clickfn;
                if(field.clickfn!="") {
                    node.onclick = function(event){window[fn](process_num, event.target.innerHTML);}
                }
                i.appendChild(node);
            }
        } else if(field.type=='image') {
            i = document.createElement("input");
            i.type = field.type;
            i.name = field.name;
            i.id = field.id;
            i.src = field.src;
            i.alt = field.alt;
            i.height = field.height;
            i.width = field.width;
            fn = field.clickfn;
            if(field.clickfn!="") {
                i.onclick = function(){window[fn](process_num);}
            }
        } else {
            i = document.createElement("input");
            i.type = field.type;
            i.name = field.name;
            i.id = field.id;
            if('readonly' in field && field.readonly) {
                i.readOnly = field.readonly;
            }
            if(field.values!="") {
                i.value = field.values;
            } else if(default_values && field.name in default_values) {
                i.value = default_values[field.name];
            }
            fn = field.clickfn;
            if(field.clickfn!="") {
                i.onclick = function(){window[fn](process_num, default_values);}
            }
        }
        f.appendChild(li);
        f.appendChild(i);
    }
    li = document.createElement("div");
    li.innerHTML = "";
    f.appendChild(li);
}

function createNextForm(process_num, default_values) {
    //default_values = default_values || null;
    //form number of the next form to becreated = 1 + form number of the form presently being displayed
    f = document.getElementsByTagName("FORM")[0];
    f.outerHTML = "";
    next_num = +(f.id.slice(-1)) +1;
    create_form(process_num, next_num, default_values);
}

//function to save the data passed to it.
//presently onlu writes to console as was stated.
//to be replaced by a database write.
function save(save_data) {
    var save_str = "";
    for (var index in save_data) {
        if (!save_data.hasOwnProperty(index)) {
            continue;
        }
        save_str += index+" : "+save_data[index]+", ";
    }
    console.log(save_str);
}
/******************************************************************************/


/**********************task1 functions*****************************************/

//function being called when a name is clicked from the AttendeeList
function eventAttendeeList(process_num, guest_name) {
    var guest;
    var default_values = [];
    for(var i=0; i<guestListData.length; i++) {
        guest = guestListData[i];
        if(guest.name==guest_name) {
            default_values['guest_name'] = guest.name;
            if('email' in guest) {default_values['email'] = guest.email;}
            if('customerID' in guest) {default_values['customerID'] = guest.customerID;}
        }
    }
    createNextForm(process_num, default_values);
}

//function being called when the next data capture form is submitted
function submitForm(process_num) {
    var guest_name = document.getElementById('guest_name').value;
    var customerID = document.getElementById('customerID').value;
    var post_code = document.getElementById('post_code').value;
    var email = document.getElementById('email').value;
    var subscribe = document.getElementById('subscribe').checked;

    if(subscribe && email!='') {
        template = 'registrationEmail';
        window.AkkrooAPI.sendEmail(email, 'registrationEmail', {'name':guest_name}, function(template) {
                console.log('Email template: ', template);
        });
    }    var save_data = {"Guest Name": guest_name, "Customer ID":customerID, "Email":email, "Postcode":post_code, "OptedIn":subscribe};
    save(save_data);
    createNextForm(process_num);
}


/******************************************************************************/
/**********************task2 functions*****************************************/

//function called when the user enters his name in the data capture form
//randomly decides whether or not the user is a winner
function instantWin(process_num) {
    var guest_name = document.getElementById('guest_name').value;
    rand_num = 2;//Math.floor((Math.random() * 10) + 1);
    var winner;
    if(rand_num%2 == 0) {
        winner = true;
    }
    var default_values = {"guest_name": guest_name, "condition": winner};
    createNextForm(process_num, default_values);
}

//function called after the user fills in the email (and prize preferrence) in the data capture form and hits the submit button
function mailDispatch(process_num, default_values) {
    var guest_name = document.getElementById('guest_name').value;
    var email = document.getElementById('email').value;
    var prize_preff = document.getElementById('prize').value;
    if(default_values['condition']) {
        window.AkkrooAPI.generateVoucherCode(guest_name, function(code) {
			console.log('Example voucher code: ', code);
                        template = 'voucherCodeEmail';
                        window.AkkrooAPI.sendEmail(email, 'voucherCodeEmail', {'name':guest_name, 'voucherCode':code}, function(template) {
                                console.log('Email template: ', template);
                        });
		});
    }
    var save_data = {"Guest Name":guest_name, "Email":email, "Prize preferrence":prize_preff};
    save(save_data);
    createNextForm(process_num, default_values);
}

//function to populate the conditional fields from the processConditional<process_num> part of the config data
function conditionalFields(form, process_num) {
    var process = load(process_num);
    
    var num_forms = process.num_forms;
    
    //choose a random form out of the forms present for this condition
    var rand_form = Math.floor(Math.random() * (num_forms) + 1);
    if(rand_form>num_forms) {//if form number is out of range, choose the last form
        rand_form = num_forms;
    }
    
    var lh;
    lh = document.createElement("div");
    lh.innerHTML = process['form'+rand_form].heading;
    form.appendChild(lh);
    
    var fields = process['form'+rand_form].fields;
    for (var index = 0; index<fields.length;index++) {
        addField(process_num, form, fields[index]);
    }
}