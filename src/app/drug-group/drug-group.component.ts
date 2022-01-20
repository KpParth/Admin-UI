import { Component, OnInit, ViewChild } from '@angular/core';
import { ProviderAdminRoleService } from "../services/ProviderAdminServices/state-serviceline-role.service";
import { dataService } from '../services/dataService/data.service';
import { DrugMasterService } from '../services/ProviderAdminServices/drug-master-services.service';
import { ConfirmationDialogsService } from './../services/dialog/confirmation.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-drug-group',
  templateUrl: './drug-group.component.html'
})
export class DrugGroupComponent implements OnInit {

  filteredavailableDrugGroups: any = [];
  showDrugGroups: any = true;
  availableDrugGroups: any = [];
  data: any;
  providerServiceMapID: any;
  provider_states: any;
  provider_services: any;
  service_provider_id: any;
  showPaginationControls: any = true;
  editable: any = false;
  availableDrugGroupNames: any = [];
  serviceID104: any;
  createdBy: any;
  sno: any = 0;
  invalidDrugDesc = false;
  @ViewChild('drugGroupForm') drugGroupForm: NgForm;
  constructor(public providerAdminRoleService: ProviderAdminRoleService,
    public commonDataService: dataService,
    public drugMasterService: DrugMasterService,
    private alertMessage: ConfirmationDialogsService) {
    this.data = [];
    this.service_provider_id = this.commonDataService.service_providerID;
    this.serviceID104 = this.commonDataService.serviceID104;
    this.createdBy = this.commonDataService.uname;
  }

  ngOnInit() {
    this.getAvailableDrugs();
    this.getStatesByServiceID();

  }

  stateSelection(stateID) {
    this.getServices(stateID);
  }

  getAvailableDrugs() {
    this.drugGroupObj = {};
    this.drugGroupObj.serviceProviderID = this.service_provider_id;
    this.drugMasterService.getDrugGroups(this.drugGroupObj).subscribe(response => this.getDrugGroupsSuccessHandeler(response),
      (err) => {
        console.log("error", err);
        //this.alertMessage.alert(err, 'error')
      });
  }

  getDrugGroupsSuccessHandeler(response) {
    this.availableDrugGroups = response;
    this.filteredavailableDrugGroups = response;
    for (let availableDrugGroup of this.availableDrugGroups) {
      this.availableDrugGroupNames.push(availableDrugGroup.drugGroup);
    }
  }
  getServices(stateID) {
    this.providerAdminRoleService.getServices(this.service_provider_id, stateID).subscribe(response => this.getServicesSuccessHandeler(response),
      (err) => {
        console.log("error", err);
        //this.alertMessage.alert(err, 'error')
      });
  }

  getStates() {
    this.providerAdminRoleService.getStates(this.service_provider_id).subscribe(response => this.getStatesSuccessHandeler(response),
      (err) => {
        console.log("error", err);
        //this.alertMessage.alert(err, 'error')
      });
  }

  getStatesByServiceID() {
    this.drugMasterService.getStatesByServiceID(this.serviceID104, this.service_provider_id).subscribe(response => this.getStatesSuccessHandeler(response),
      (err) => {
        console.log("error", err);
        //this.alertMessage.alert(err, 'error')
      });
  }

  getStatesSuccessHandeler(response) {
    this.provider_states = response;
  }

  getServicesSuccessHandeler(response) {
    this.provider_services = response;
    for (let provider_service of this.provider_services) {
      if ("104" == provider_service.serviceName) {
        this.providerServiceMapID = provider_service.providerServiceMapID;
      }
    }
  }

  responseHandler(response) {
    this.data = response;
  }

  showForm() {
    this.showDrugGroups = false;
    this.inValidDrugGroup = false;
    this.invalidDrugDesc = false;
  }

  drugGroupObj: any;
  // = {
  // 	'drugGroup':'',
  //   'drugGroupDesc':'',
  //   'providerServiceMapID':'',
  //   'createdBy':''
  // };
  drugGroupList: any = [];

  addDrugGroupToList(values) {
    
      this.drugGroupObj = {};
      this.drugGroupObj.drugGroup = values.drugGroup.trim();
      this.drugGroupObj.drugGroupDesc = values.drugGroupDesc.trim();

      this.drugGroupObj.serviceProviderID = this.service_provider_id;
      this.drugGroupObj.createdBy = this.createdBy;
      this.checkDuplicates(this.drugGroupObj);
  }
  checkDuplicates(object) {
    let duplicateStatus = 0
    if (this.drugGroupList.length === 0) {
      this.drugGroupList.push(object);
    }
    else {
      for (let i = 0; i < this.drugGroupList.length; i++) {
        if (this.drugGroupList[i].drugGroup === object.drugGroup
        ) {
          duplicateStatus = duplicateStatus + 1;
        }
      }
      if (duplicateStatus === 0) {
        this.drugGroupList.push(object);
      }
      else {
        this.alertMessage.alert("Already exists");
      }
    }
  }
  storeDrugGroup() {
    let obj = { "drugGroups": this.drugGroupList };
    this.drugMasterService.saveDrugGroups(JSON.stringify(obj)).subscribe(response => this.successHandler(response));
  }

  successHandler(response) {
    this.drugGroupList = [];
    this.alertMessage.alert("Saved successfully", 'success');
    this.getAvailableDrugs();
    this.clearEdit();
  }
  dataObj: any = {};
  updateDrugGroupStatus(drugGroup) {
    let flag = !drugGroup.deleted;
    let status;
    if (flag === true) {
      status = "Deactivate";
    }
    if (flag === false) {
      status = "Activate";
    }
    this.alertMessage.confirm('Confirm', "Are you sure you want to " + status + "?").subscribe(response => {
      if (response) {

        this.dataObj = {};
        this.dataObj.drugGroupID = drugGroup.drugGroupID;
        this.dataObj.deleted = !drugGroup.deleted;
        this.dataObj.modifiedBy = this.createdBy;
        this.drugMasterService.updateDrugStatus(this.dataObj).subscribe(response => { this.alertMessage.alert(status + "d successfully", 'success') },
          (err) => {
            console.log("error", err);
            //this.alertMessage.alert(err, 'error')
          });
        drugGroup.deleted = !drugGroup.deleted;

      }

    })
  }
  activePage;
  // updateStatusHandler(response) {

  //   console.log("Drug Group status changed");
  // }

  remove_obj(index) {
    this.drugGroupList.splice(index, 1);
  }

  drugGroupID: any;
  drugGroup: any;
  drugGroupDesc: any;
  stateID: any;

  initializeObj() {
    this.drugGroupID = "";
    this.drugGroup = "";
    this.drugGroupDesc = "";
    this.stateID = "";
  }
  editDrugGroup(drug) {
    this.drugGroupID = drug.drugGroupID;
    this.drugGroup = drug.drugGroup
    this.drugGroupDesc = drug.drugGroupDesc;
    //this.stateID = drug.m_providerServiceMapping.state.stateID;
    this.editable = true;
  }

  updateDrugGroup(drugGroup) {
    if (drugGroup.drugGroup.trim() === "") {

      this.alertMessage.alert("Please enter valid Drug Group Name");
    }

    else {
      this.dataObj = {};
      this.dataObj.drugGroupID = this.drugGroupID;
      this.dataObj.drugGroup = drugGroup.drugGroup.trim();
      this.dataObj.drugGroupDesc = drugGroup.drugGroupDesc;
      //this.dataObj.providerServiceMapID = drugGroup.providerServiceMapID;
      this.dataObj.modifiedBy = this.createdBy;
      this.drugMasterService.updateDrugGroup(this.dataObj).subscribe(response => {
        if (response !== undefined && response !== null)
          this.updateHandler(response)
      },
        (err) => {
          console.log("error", err);
          //this.alertMessage.alert(err, 'error')
        });
    }

  }

  updateHandler(response) {
    this.editable = false;
    this.alertMessage.alert("Updated successfully", 'success');
    this.getAvailableDrugs();
    this.availableDrugGroupNames = [];
  }

  groupNameExist: any = false;
  inValidDrugGroup = false;
  checkExistance(drugGroup) {
    if(drugGroup.trim() !== ""){
      this.inValidDrugGroup = false;
      this.groupNameExist = this.availableDrugGroupNames.includes(drugGroup.trim());
    }
    else{
      this.inValidDrugGroup = true;
      this.groupNameExist = false;
    }
  }
  clearEdit() {
    this.initializeObj();
    this.showDrugGroups = true;
    this.editable = false;
    this.groupNameExist = false;
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredavailableDrugGroups = this.availableDrugGroups;
    } else {
      this.filteredavailableDrugGroups = [];
      this.availableDrugGroups.forEach((item) => {
        for (let key in item) {
          if (key == 'drugGroup') {
            let value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredavailableDrugGroups.push(item); break;
            }
          }
        }
      });
    }

  }
  back() {
    this.alertMessage.confirm('Confirm', "Do you really want to cancel? Any unsaved data would be lost").subscribe(res => {
      if (res) {
        this.drugGroupForm.resetForm();
        this.clearEdit();
        this.drugGroupList = [];
      }
    })
  }
  checkForValidDrugDesc(drugDesc) {
    if(drugDesc.trim() === "") {
      this.invalidDrugDesc = true;
    } else {
      this.invalidDrugDesc = false;
    }

  }

}