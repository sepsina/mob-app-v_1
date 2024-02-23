/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { EventsService } from './events.service';
import { UdpService } from './udp.service';
import { Platform } from '@ionic/angular';

import * as gConst from './gConst';
//import * as gIF from './gIF';

const NO_SEL = 0;
const T_SENS = 1;
const RH_SENS = 2;
const ON_OFF_ACT = 3;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit{

    selectedType = NO_SEL;
    g_const = gConst;

    udpBusy = false;
    socketStatus = false;

    itemsMap = new Map();

    test = 15;

    constructor(public udp: UdpService,
                public platform: Platform,
                public events: EventsService,
                public ngZone: NgZone) {
        this.platform.ready().then(()=>{
            setTimeout(()=>{
                this.udp.initSocket();
            }, 100);
        });
    }

    /***********************************************************************************************
     * fn          ngAfterViewInit
     *
     * brief
     *
     */
    ngAfterViewInit(): void {
        // ---
    }

    /***********************************************************************************************
     * fn          ngOnInit
     *
     * brief
     *
     */
    ngOnInit() {

        this.udpBusy = this.udp.rdCmd.busy;
        this.udp.itemsRef = this.itemsMap;

        this.events.subscribe('newItem', (msg)=>{
            this.ngZone.run(()=>{
                this.itemsMap.set(msg.key, msg.value);
            });
        });
        window.onbeforeunload = ()=>{
            this.ngOnDestroy();
        };
        /*
        this.events.subscribe('socketStatus', (status: boolean)=>{
            this.socketStatus = status;
            if(status === true){
                this.readSelected();
            }
        });
        */
    }

    /***********************************************************************************************
     * fn          ngOnDestroy
     *
     * brief
     *
     */
    ngOnDestroy() {
        this.udp.closeSocket();
    }

    /***********************************************************************************************
     * @fn          readSelected
     *
     * @brief
     *
     */
    async readSelected(){

        if(this.udpBusy === true || this.udp.bridges.length === 0){
            return;
        }
        this.itemsMap.clear();

        switch(this.selectedType){
            case ON_OFF_ACT: {
                this.udp.readItems(gConst.ON_OFF_ACTUATORS);
                break;
            }
            case T_SENS: {
                this.udp.readItems(gConst.T_SENSORS);
                break;
            }
            case RH_SENS: {
                this.udp.readItems(gConst.RH_SENSORS);
                break;
            }
            default:
                break;
        }
    }

    /***********************************************************************************************
     * @fn          getSelDesc
     *
     * @brief
     *
     */
    getSelDesc(){

        let desc = '- - -';

        switch(this.selectedType){
            case ON_OFF_ACT: {
                desc = 'on-off actuators';
                break;
            }
            case T_SENS: {
                desc = 'temperature';
                break;
            }
            case RH_SENS: {
                desc = 'humidity';
                break;
            }
            default:
                break;
        }
        return desc;
    }

    /***********************************************************************************************
     * @fn          selTemp
     *
     * @brief
     *
     */
    selTemp(){
        this.selectedType = T_SENS;
        this.readSelected();
    }
    /***********************************************************************************************
     * @fn          selRH
     *
     * @brief
     *
     */
    selRH(){
        this.selectedType = RH_SENS;
        this.readSelected();
    }
    /***********************************************************************************************
     * @fn          selOnOffAct
     *
     * @brief
     *
     */
    selOnOffAct(){
        this.selectedType = ON_OFF_ACT;
        this.readSelected();
    }

}
