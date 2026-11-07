/* Fictional demonstration records. No live buyer, stock, carrier or email connection. */
window.ADHUNIK_DEMO = {
  version: 1,
  asOf: '2026-11-07',
  role: 'Owner',
  buyers: [
    {id:'B-101',name:'Midlands Rover Supplies',contact:'Oliver Bennett',city:'Birmingham',country:'United Kingdom',port:'Felixstowe',email:'oliver@midlandsrover.example',terms:'30% advance, balance before dispatch',category:'Land Rover spares'},
    {id:'B-102',name:'East Africa Fleet Parts',contact:'Amina Otieno',city:'Nairobi',country:'Kenya',port:'Mombasa',email:'amina@eafleet.example',terms:'50% advance, balance before dispatch',category:'Truck spares'},
    {id:'B-103',name:'Colombo Scooter House',contact:'Nimal Perera',city:'Colombo',country:'Sri Lanka',port:'Colombo',email:'nimal@colomboscooter.example',terms:'100% before dispatch',category:'Scooter spares'},
    {id:'B-104',name:'Gulf Utility Auto Parts',contact:'Khalid Mansoor',city:'Dubai',country:'United Arab Emirates',port:'Jebel Ali',email:'khalid@gulfutility.example',terms:'30% advance, balance before dispatch',category:'Land Rover spares'},
    {id:'B-105',name:'Cape Heritage Motors',contact:'Thandi Jacobs',city:'Cape Town',country:'South Africa',port:'Cape Town',email:'thandi@capeheritage.example',terms:'50% advance, balance before dispatch',category:'Land Rover spares'},
    {id:'B-106',name:'Pacific Agro Components',contact:'James Wilson',city:'Auckland',country:'New Zealand',port:'Auckland',email:'james@pacificagro.example',terms:'100% before dispatch',category:'Tractor spares'}
  ],
  enquiries: [
    {id:'ENQ-26048',buyer:'B-104',subject:'Defender service parts for November',category:'Land Rover spares',owner:'Rohit Mehra',received:'2026-11-06',due:'2026-11-09',status:'Stock check',incoterm:'FOB Nhava Sheva',freight:0,stockChecked:false,items:[
      {part:'LR-BP-110',name:'Defender front brake pad set',qty:120,stock:120,unit:'sets',price:18.5},
      {part:'LR-WB-090',name:'Wheel bearing kit',qty:80,stock:56,unit:'kits',price:24},
      {part:'LR-WP-200',name:'Water pump assembly',qty:40,stock:40,unit:'pcs',price:32},
      {part:'LR-OF-300',name:'Oil filter',qty:200,stock:200,unit:'pcs',price:4.8}
    ],notes:[{date:'2026-11-06',text:'Buyer requested neutral cartons and part numbers on each inner box.',by:'Rohit Mehra'}]},
    {id:'ENQ-26047',buyer:'B-105',subject:'Series III restoration assortment',category:'Land Rover spares',owner:'Priya Khanna',received:'2026-11-05',due:'2026-11-08',status:'Quote ready',incoterm:'FOB Nhava Sheva',freight:0,stockChecked:true,items:[
      {part:'LR-KP-088',name:'King pin kit',qty:60,stock:75,unit:'kits',price:22},
      {part:'LR-CC-109',name:'Clutch cover assembly',qty:30,stock:35,unit:'pcs',price:48},
      {part:'LR-RH-050',name:'Radiator hose set',qty:100,stock:150,unit:'sets',price:9.5}
    ],notes:[]},
    {id:'ENQ-26046',buyer:'B-106',subject:'Tractor bearing and seal replenishment',category:'Tractor spares',owner:'Rohit Mehra',received:'2026-11-05',due:'2026-11-10',status:'Stock check',incoterm:'FOB Nhava Sheva',freight:0,stockChecked:false,items:[
      {part:'TR-BR-6208',name:'Deep groove ball bearing',qty:250,stock:180,unit:'pcs',price:8.4},
      {part:'TR-OS-045',name:'Axle oil seal',qty:300,stock:400,unit:'pcs',price:2.6}
    ],notes:[]},
    {id:'ENQ-26045',buyer:'B-101',subject:'Discovery brake and suspension kits',category:'Land Rover spares',owner:'Priya Khanna',received:'2026-11-04',due:'2026-11-09',status:'Quoted',incoterm:'FOB Nhava Sheva',freight:0,stockChecked:true,items:[
      {part:'LR-BD-300',name:'Front brake disc',qty:80,stock:95,unit:'pcs',price:28},
      {part:'LR-SB-025',name:'Suspension bush kit',qty:120,stock:140,unit:'kits',price:12.5}
    ],notes:[{date:'2026-11-06',text:'Quote shared in the demo. Follow up on quantities on 9 November.',by:'Priya Khanna'}]},
    {id:'ENQ-26044',buyer:'B-102',subject:'Fleet workshop clutch replenishment',category:'Truck spares',owner:'Rohit Mehra',received:'2026-11-04',due:'2026-11-09',status:'Quote ready',incoterm:'FOB Nhava Sheva',freight:0,stockChecked:true,items:[
      {part:'TK-CP-350',name:'Truck clutch plate',qty:50,stock:70,unit:'pcs',price:54},
      {part:'TK-RB-090',name:'Clutch release bearing',qty:100,stock:125,unit:'pcs',price:15}
    ],notes:[]},
    {id:'ENQ-26043',buyer:'B-103',subject:'Scooter engine service assortment',category:'Scooter spares',owner:'Priya Khanna',received:'2026-10-30',due:'2026-11-03',status:'Confirmed',incoterm:'FOB Nhava Sheva',freight:0,stockChecked:true,items:[
      {part:'SC-CC-150',name:'Scooter clutch cable',qty:400,stock:500,unit:'pcs',price:2.2},
      {part:'SC-GS-150',name:'Engine gasket set',qty:200,stock:300,unit:'sets',price:5.6},
      {part:'SC-BS-090',name:'Brake shoe set',qty:250,stock:300,unit:'sets',price:4}
    ],notes:[]},
    {id:'ENQ-26042',buyer:'B-102',subject:'Truck brake and king pin kits',category:'Truck spares',owner:'Rohit Mehra',received:'2026-10-28',due:'2026-11-02',status:'Confirmed',incoterm:'FOB Nhava Sheva',freight:0,stockChecked:true,items:[
      {part:'TK-KP-080',name:'Heavy duty king pin kit',qty:100,stock:120,unit:'kits',price:38},
      {part:'TK-BL-160',name:'Truck brake lining set',qty:150,stock:160,unit:'sets',price:26},
      {part:'TK-WB-302',name:'Taper roller bearing',qty:200,stock:250,unit:'pcs',price:14}
    ],notes:[]},
    {id:'ENQ-26041',buyer:'B-101',subject:'Defender winter service shipment',category:'Land Rover spares',owner:'Priya Khanna',received:'2026-10-22',due:'2026-10-28',status:'Confirmed',incoterm:'FOB Nhava Sheva',freight:0,stockChecked:true,items:[
      {part:'LR-WP-200',name:'Water pump assembly',qty:100,stock:120,unit:'pcs',price:32},
      {part:'LR-OF-300',name:'Oil filter',qty:500,stock:600,unit:'pcs',price:4.8},
      {part:'LR-BP-110',name:'Defender front brake pad set',qty:200,stock:250,unit:'sets',price:18.5}
    ],notes:[]}
  ],
  shipments:[
    {id:'SHP-26018',enquiry:'ENQ-26043',status:'Packing',carrier:'Oceanlink Logistics',reference:'Booking pending',cartons:24,weight:386,etd:'2026-11-10',eta:'2026-11-15',events:[{date:'2026-11-05',status:'Packing',text:'Neutral export cartons being prepared.',by:'Neha Sharma'}]},
    {id:'SHP-26017',enquiry:'ENQ-26042',status:'In transit',carrier:'Meridian Freight',reference:'DEMO-MF-826017',cartons:64,weight:1240,etd:'2026-11-04',eta:'2026-11-18',events:[{date:'2026-11-02',status:'Packing',text:'64 cartons packed and checked.',by:'Neha Sharma'},{date:'2026-11-03',status:'Ready to dispatch',text:'Packing list and commercial invoice checked.',by:'Neha Sharma'},{date:'2026-11-04',status:'In transit',text:'Departed Nhava Sheva. Next update at destination port.',by:'Neha Sharma'}]},
    {id:'SHP-26016',enquiry:'ENQ-26041',status:'Delivered',carrier:'Seabridge Cargo',reference:'DEMO-SC-826016',cartons:48,weight:875,etd:'2026-10-27',eta:'2026-11-06',events:[{date:'2026-10-24',status:'Packing',text:'Cartons sealed after quantity checks.',by:'Neha Sharma'},{date:'2026-10-26',status:'Ready to dispatch',text:'Export documents ready.',by:'Neha Sharma'},{date:'2026-10-27',status:'In transit',text:'Departed Nhava Sheva.',by:'Neha Sharma'},{date:'2026-11-06',status:'Delivered',text:'Delivery acknowledged by buyer.',by:'Neha Sharma'}]}
  ]
};
