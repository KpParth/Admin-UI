import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ItemService } from '../services/inventory-services/item.service';
import { CommonServices } from '../services/inventory-services/commonServices';
import { ItemFacilityMappingService } from '../services/inventory-services/item-facility-mapping.service';
import { Mainstroreandsubstore } from '../services/inventory-services/mainstoreandsubstore.service';
import { dataService } from '../services/dataService/data.service';
import { ConfirmationDialogsService } from '../services/dialog/confirmation.service';
import { MdDialog, MdDialogConfig, MdDialogRef } from '@angular/material';
import { MD_DIALOG_DATA } from '@angular/material';


@Component({
  selector: 'app-item-to-store-mapping',
  templateUrl: './item-to-store-mapping.component.html',
  styleUrls: ['./item-to-store-mapping.component.css']
})
export class ItemToStoreMappingComponent implements OnInit {

  providerServiceMapID: any;
  providerID: any;
  userID: any;
  state: any;
  service: any;
  createdBy: any;
  storeType: boolean = true;
  showFormFlag: boolean = false;
  itemCategoryselected:any={};


  services: any = [];
  filteredItemList: any = [];
  itemFacilityMapList: any = [];
  itemFacilityMapView: any = [];
  states: any = [];
  stores: any = [];
  itemCategory: any = [];
  itemsList: any = [];
  mapType: any = false;
  disableSelection: boolean = false;
  bufferarray: any = [];
  mainstores:any=[];
  substores:any=[];
  mainStore:any={};
  @ViewChild('mappingFieldsForm') mappingFieldsForm: NgForm;

  constructor(public commonDataService: dataService,
    public itemService: ItemService,
    public commonServices: CommonServices,
    public storeService: Mainstroreandsubstore,
    public dialogService: ConfirmationDialogsService,
    public dialog: MdDialog,
    public itemFacilityMappingService: ItemFacilityMappingService) {
    this.providerID = this.commonDataService.service_providerID;
  }

  ngOnInit() {
    debugger;
    this.createdBy = this.commonDataService.uname;
    console.log("this.createdBy", this.createdBy);

    this.userID = this.commonDataService.uid;
    console.log('userID', this.userID);
    this.getAllServices();

  }
  getAllServices() {
    this.commonServices.getServiceLines(this.userID).subscribe((response) => {
      console.log("serviceline", response);
      this.servicesSuccesshandler(response)

    }, (err) => { console.log("ERROR in fetching serviceline") });
  }
  servicesSuccesshandler(res) {
    this.services = res
    // .filter((item) => {
    //   console.log('item', item);     
    // })
  }

  setProviderServiceMapID(providerServiceMapID) {
    console.log("providerServiceMapID", providerServiceMapID);
    this.providerServiceMapID = providerServiceMapID;
    console.log('psmid', this.providerServiceMapID);
    // this.getAllItemsList(providerServiceMapID);
    this.setStores(providerServiceMapID);
    this.setItemCat(providerServiceMapID);
    this.getAllItemFacilityMapping(providerServiceMapID);
  }

  getAllItemFacilityMapping(providerServiceMapID) {


    this.itemFacilityMappingService.getAllFacilityItemMapping(providerServiceMapID).subscribe((response) => {
      console.log("serviceline", response);
      this.itemFacilityMapView = response;
      this.itemFacilityMapList = response;
      debugger;
    },
      (err) => { console.log("ERROR in fetching serviceline") });
  }

  setStores(providerServiceMapID) {
    this.storeService.getAllStores(providerServiceMapID).subscribe((response) => {
      console.log("serviceline", response);
      this.stores = response;
      this.filterStore(this.stores);
      debugger;
    },
      (err) => { console.log("ERROR in fetching serviceline") });
  }

  setItemCat(providerServiceMapID) {
    this.itemService.getAllItemsCategory(providerServiceMapID, 0).subscribe((response) => {
      console.log("serviceline", response);
      this.itemCategory = response;
      debugger;
    },
      (err) => { console.log("ERROR in fetching serviceline") });
  }

  getStates(service) {
    debugger;
    console.log("value", service);
    this.commonServices.getStatesOnServices(this.userID, service.serviceID, false).
      subscribe(response => this.getStatesSuccessHandeler(response, service), (err) => {
        console.log("error in fetching states")
      });


  }
  getStatesSuccessHandeler(response, service) {
    this.states = response;
  }
  filterItemFromList(searchTerm?: string) {
    if (!searchTerm) {
      this.itemFacilityMapView = this.itemFacilityMapList;
    }
    else {
      this.filteredItemList = [];
      this.itemFacilityMapList.forEach((item) => {
        for (let key in item) {
          let value: string = '' + item[key];
          if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
            this.itemFacilityMapView.push(item); break;
          }
        }
      });
    }

  }

  showForm() {
    this.showFormFlag = true;
  }

  onCategorySelected(category,mainID) {
    if(this.storeType){
      this.itemFacilityMappingService.getItemsOnCategory(this.providerServiceMapID, category).subscribe((response) => {
        console.log("serviceline", response);
        this.itemsList = response;
        debugger;
      },
        (err) => { console.log("ERROR in fetching items") });
    }else{
      this.itemFacilityMappingService.getItemsForSubStore(this.providerServiceMapID, mainID).subscribe((response) => {
        console.log("serviceline", response);
        this.itemsList = response;
        debugger;
      },
        (err) => { console.log("ERROR in fetching items") });
    }
    

  }

  addtoBufferArray(value) {
    
    var obj = {
      "facilityID": value.mainStore.facilityID,
      "facilityName": value.mainStore.facilityName,
      "itemID1": [],
      "item": [],
      "mappingType": "Individual",
      "createdBy": "Akash",
      "status": "Active",
      "providerServiceMapID": this.providerServiceMapID
    }
    if(!value.storeType){
    if(value.subStore!=undefined){
        obj.facilityID=value.subStore.facilityID
        obj.facilityName=value.subStore.facilityName
      }else{
        this.dialogService.alert("Please select Substore Before Proceeding");
        return;
      }
      
    }else{
      if(value.mainStore==undefined){
        this.dialogService.alert("Please select Substore Before Proceeding");
        return;
      }
    }
    
    if (value.mapType) {
      obj.mappingType = "BULK";
      this.itemsList.forEach(element => {
        obj.itemID1.push(element.itemID);
        obj.item.push(element);
      });
    }else{
      if(value.itemName!= undefined && value.itemName.length>0){
        value.itemName.forEach(element => {
          obj.itemID1.push(element.itemID);
          obj.item.push(element);
        });
      }else{
        this.dialogService.alert("Please add Items Before Proceeding");
        return;
      }

     
    }
    
    obj = this.checkInMain(obj);
    if (obj.itemID1.length > 0) {
      if (this.checkinBuffer(obj)) {
        this.bufferarray.push(obj);
      }
    }

    this.resetForm();
    debugger;

  }

  removeRow(index) {
    this.bufferarray.splice(index, 1);
  }

  removeItem(rowIndex, stateIndex) {
    this.bufferarray[rowIndex].itemID1.splice(stateIndex, 1);
    this.bufferarray[rowIndex].item.splice(stateIndex, 1);

    if (this.bufferarray[rowIndex].itemID1.length === 0) {
      this.bufferarray.splice(rowIndex, 1);
    }
  }

  checkinBuffer(obj) {
    var checkobj = [];
    checkobj = this.bufferarray.filter(function (item) {
      return item.facilityID == obj.facilityID
        ; // This value has to go in constant
    });
    if (checkobj.length == 0 ) {
      return true
    } else {
      var erroritems = []
      for (var i = 0; i < obj.itemID1.length; i++) {
        if (checkobj[0].itemID1.indexOf(obj.itemID1[i]) == -1) {
          checkobj[0].itemID1.push(obj.itemID1[i]);
          checkobj[0].item.push(obj.item[i]);
        } else {
          erroritems.push(obj.item[i].itemName);
        }
      }
      if (erroritems.length > 0) {
        this.dialogService.alert(erroritems.toString() + " already added for mapping in " + obj.facilityName + " facility");
      }
    }
    return false;
  }

  //   checkforitems(master,slave){
  // for(){

  // }
  //   }
  checkInMain(input) {
    var obj = input;
    var faciltyitem = this.itemFacilityMapList.filter(function (item) {
      return item.facilityID == obj.facilityID; // This value has to go in constant
    });
    var erroritems = [];
    for (var i = 0; i < obj.itemID1.length; i++) {
      for (var j = 0; j < faciltyitem.length; j++) {
        if (faciltyitem[j].itemID == obj.itemID1[i]) {
          obj.itemID1.splice(i, 1)
          obj.item.splice(i, 1)
          erroritems.push(obj.item[i].itemName);
        }
      }
    }
    if (erroritems.length > 0) {
      this.dialogService.alert(erroritems.toString() + " Already exists in " + obj.facilityName + " facility");
    }
    return obj
  }
  resetForm() {
    this.mappingFieldsForm.reset();
    this.storeType=true;
    this.mapType=false;
    // this.provider = undefined;
    // this.serviceline = undefined;
    // this.state = undefined;
    // this.isNational = false;
  }

  submitMapping() {
    this.itemFacilityMappingService.setFacilityItemMapping(this.bufferarray).subscribe(response => {
      console.log(response, 'after successful mapping of provider to service and state');
      this.dialogService.alert('Mapping saved successfully', 'success');
      this.bufferarray = [];
      this.resetForm();
    }, err => {
      this.dialogService.alert(err, 'error');
      console.log(err, 'ERROR');
    });

  }
  filterStore(store){
    this.mainstores=store.filter(function (item) {
      return item.isMainFacility == 1; // This value has to go in constant
    });
  }

  subStorelist(facID){
    this.itemCategoryselected={};
    this.substores=this.stores.filter(function (item) {
      return item.mainFacilityID == facID; // This value has to go in constant
    });
  }

  deleteMapping(id,bool){
    this.itemFacilityMappingService.deleteFacilityItemMapping(id,bool).subscribe(response => {
      // console.log(response, 'after successful mapping of provider to service and state');
      this.getAllItemFacilityMapping(this.providerServiceMapID);
    }, err => {
      this.dialogService.alert(err, 'error');
      console.log(err, 'ERROR');
    });
  }
  activate(id){
this.deleteMapping(id,true);
  }
  deactivate(id){
    this.deleteMapping(id,false);
  }
}
