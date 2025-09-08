// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract FarmToStoreTraceability {
    enum Role { None, Farmer, Transporter, Store_manager }
    enum Crop_Status { Pick_Up,In_Transit,Delivered}
    struct User {
        address user_address;
        string name;
        string location;
        uint successful_delivery;
        Role role;  
    }

    struct PendingRequest {
        address pending_address;
        string name;
        string location;
        Role requestedRole;
        bool isApproved;
        bool exists;
    }
    struct farmer_chain{
        uint id;
        address farmer;
        string product_name;
        string sent_to;
        address store;
        string through;
        address transporter;
        uint date;
    }
    struct transporter_chain{
        uint id;
        address farmer;
        address store;
        string farmer_name;
        string store_name;
        string crop_name;
        string from;
        string to;
        uint date;
    }
    struct store_chain{
        uint id;
        address farmer;
        address transporter;
        string farmer_name;
        string transporter_name;
        uint date;
        string product_name;
        uint quantity;
    }

    struct available_Crop {
        uint id;
        string name;
        uint quantity;
        uint harvestDate;
        // address store;
        //destination address
        address farmer;
      
    }

    struct Deliveries{
        uint cropId;
        string name;
        address farmer;
        address transporter;
        address store;
        string pick_up_location;
        string destination;
        uint quantity;
        Crop_Status status;
    }

    struct product_in_store{
        uint id;
        string name;
        address owner_address;
        address transporter_address;
        uint quantity;
        uint arrival_date
    }

    mapping(address => farmer_chain[]) public farmer_history;
    mapping(address => transporter_chain[]) public transporter_history;
    mapping(address => store_chain[]) public store_history;
    mapping(uint => Deliveries) public pendingDeliveries;
    mapping(uint => available_Crop) public crops;
    mapping(uint => PendingRequest[]) public pendingUsers;
    mapping(address => Role) public roles;
    mapping(uint => product_in_store[])public product_inStore;
   
    uint public cropCount;
    uint public deliveryCount;
    uint public store_product_count;
    uint public pending_users_count;

    address public owner;

     mapping(address=> User) public users;
     address[]public rejected_roles;
     address[]public farmers;
     address[]public transporters;
     address[]public store_managers;

    modifier onlyRole(Role role) {
        require(roles[msg.sender] == role, "Access denied: wrong role");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }


    function request_for_role(string memory name Role role,string memory _location) public {
        
        // require(!pendingUsers[msg.sender].exists,'already requested');
        // require(role != Role.None ,'invalid role');
        // require(!pendingUsers[msg.sender].isApproved,'request already approved');
        pending_user_count++;
        pendingUsers[pending_user_count].push(PendingRequest(msg.sender,name,_location,role,false,true));
    }

    function approve_role(uint id)public onlyOwner(){
        require(pendingUsers[id].exists,'no such user');
        require(!pendingUsers[id].isApproved,'request already approved');
        PendingRequest memory pending = pendingUsers[id];
        users[id] = User(pending.pending_address,pending.name,pending.location,pending.requestedRole);
         pendingUsers[id].isApproved = true;
         if(pending.requestedRole == Role.Farmer) farmers.push(pending.pending_address);
         if(pending.requestedRole == Role.Transporter) transporters.push(pending.pending_address);
         if(pending.requestedRole == Role.Store_manager) store_managers.push(pending.pending_address);
        delete pendingUsers[id];
        pending_users_count--;
    }

    function reject_role(uint id) public onlyOwner() {
         require(pendingUsers[id].exists,'no such user');
        require(!pendingUsers[id].isApproved,'request already approved');
        pendingUsers[id].isApproved = false;
        rejected_roles.push(id);
        delete pendingUsers[id];
        pending_users_count--;
    }
    function assignRole(address user, Role role) public onlyOwner {
        roles[user] = role;
    }
    function resign_user(address _address) public onlyOwner{
        delete users[_address];
    }

    

    //returns false if role is rejected
    function check_application_result(address _address)public returns bool {
        for (uint256 i = 0; i < rejected_roles.length; i++) {
            if(_address == rejected_roles[i]) return false;
            if(_address !== rejected_roles[i] && users[_address]) return false;
        }
    }

    // --- Farmer: Register Crop ---
    function registerCrop(string memory name, uint quantity, string memory harvestDate)
        public
        onlyRole(Role.Farmer)
    {
        cropCount++;
        crops[cropCount] = available_Crop({
            id: cropCount,
            name: name,
            quantity: quantity,
            harvestDate: harvestDate,
            farmer: msg.sender,     
        });
    }

    //when farmer clicks deliver  run this function
    function send_to_transporter( uint id, uint _quantity,address _store,address transporter string memory _pick_up_location, string memory _destination) public onlyRole(Role.Farmer){
        available_Crop storage crop = crops[id];
        require(crop.farmer == msg.sender, "Not your crop");
        deliveryCount++;
        pendingDeliveries[deliveryCount].push(Deliveries({
            id:deliveryCount,
            name:crop.name,
            farmer:msg.sender,
            transporter:transporter,
            store:_store,
            pick_up_location:_pick_up_location,
            destination:_destination,
            quantity:_quantity,
            status:Crop_Status.Pick_Up
        }));
        delete crop;
    


     
    }

    //when the transporterclick deliver button
    function product_inTransit(uint id)public onlyRole(Role.transporter){
        Deliveries storage Dc = pendingDeliveries[id];
        delivery_crop.status=Crop_Status.In_Transit;
    }



    // store manager confirm delivery
    function confirmArrival(uint cropId, uint arrival_date)
        public
        onlyRole(Role.Store_manager)
    {
        require(cropId > 0 && cropId <= crop_in_transportCount, "Invalid crop ID");
        store_product_count++
        Deliveries storage delivery_crop = pendingDeliveries[cropId];
        available_crops storage crop = crops[cropId];
        delivery_crop.status = Crop_Status.Delivered;
        users[msg.sender].successful_delivery += 1;
        users[delivery_crop.transporter].successful_delivery +=1;
        product_inStore[cropId].push(product_in_store({
            id:store_product_count,
            name:delivery_crop.name,
            owner_address:delivery_crop.farmer,
            transporter_address:delivery_crop.transporter,
            quantity: delivery_crop.quantity,
            arrival_date:arrival_date,
        }));
        

        farmer_history[delivery_crop.farmer].push(farmer_chain({
            id:,
            farmer:delivery_crop.farmer,
            product_name:delivery_crop.name,
            sent_to: users[msg.sender].name,
            store:delivery_crop.store,
            through:users[delivery_crop.transporter]
            transporter:delivery_crop.transporter
            date:
        }));

        transporter_history[delivery_crop.transporter].push(transporter_chain({
              id:,
             farmer:delivery_crop.farmer,
             store:delivery_crop.store,
             farmer_name:users[delivery_crop.farmer].name,
             store_name: users[msg.sender].name,
             crop_name:delivery_crop.name,
             from:delivery_crop.pick_up_location,
             to:delivery_crop.destination,
             date
        }));

        store_history[msg.sender].push(store_chain({
            id:,
            farmer:delivery_crop.farmer,
            transporter:delivery_crop.transporter,
            farmer_name:users[msg.sender].name,
            transporter_name:users[delivery_crop.transporter].name,
            date:,
            product_name:delivery_crop.name,
            quantity:delivery_crop.quantity,
        }));

      
    }

    // for store or transporter or farmer to see each other name and adress
    function get_user_name(address _address) public view returns (string memory) {
        return users[_address].name;
    }

    //retruns array  of address for a specific role 
    //likely  to be shown in a drop menu to fetch name using the address
    function list_user_address(string role){
        if(role== 'farmer')return farmers;
        if (role == 'transporter') return transporters;
        if(role == 'store') return store_managers;
    }

    // returns an array of a details of a particular crops with that crop id
    function getPendingCrops(uint cropId) public view returns(send_to_transporters[] memory){
    return pendindDeliveries[cropId];
    }

    function delivery_count()public views returns(uint){
        return deliveryCount;
    }
    function get_delivery_byIndex( uint crop_id)public view returns(
        uint cropId,
        string name,
        address farmer,
        address transporter,
        address store,
        string pick_up_location,
        string destination,
        uint quantity,
        Crop_Status status,
    ){
        Deliveries memory d = pendingDeliveries[crop_id]
        return (d.cropId, d.name,d.farmer,d.transporter,d.store,d.pick_up_location,d.destination,d.quantity,d.status)

    }
    //to get crop count inorder to use in the getcrop by index
    function crop_count() public view returns (uint) {
        return cropCount;
    }
    function get_crop_byIndex( uint crop_id) public view returns(
    uint id,string name,uint quantity,uint harvestDate, address farmer){
        available_crops memory c= crops[crop_id]
        return (c.crop_id,c.name,c.quantity,c.harvestDate,c.farmer)
    }

    function store_product_count()public view returns(uint){
        return store_product_count;
    }
    function get_product_byIndex(uint id)public view returns(){
        product_in_store memory p = product_inStore[id];
        return( p.id,p.name,p.owner_address, p.quantity);
    }
    //fetch list of available users
    function get_user_details(address _address) public view returns(
        address user_address,
         string name,
         string location,
         Role role){
        User memory u = users[_address];
        return(u.user_address,u.name,u.location,u.role)
    }

    function farmer_history_count(address _farmer)public view returns (uint){
        return farmer_history[_farmer].length;
    }

    function get_farmer_history_byIndex(address _farmer)public view returns(
        uint id,address farmer,string product_name,
        string sent_to,address store,string through,
        address transporter,uint date
    ){
        farmer_chain memory f = farmer_history[_farmer];
        return ( f.id,f.farmer,f.product_name,f.sent_to,f.store,f.through,f.transporter,f.date);
    }
     function transporter_history_count(address _farmer)public view returns (uint){
        return transporter_history[_farmer].length;
    }
     function get_transporter_history_byIndex(address _transporter)public view returns(
         uint id,address farmer, address store,
        string farmer_name,string store_name,string crop_name,
        string from, string to, uint date
    ){
        transporter_chain memory t = transporter_history[_transporter];
        return ( t.id,t.farmer,t.product_name,t.sent_to,t.store,t.through,t.transporter,t.date);
    }

    function store_history_count(address _store)public view returns (uint){
        return store_history[_store].length;
    }

    function get_store_history_byIndex(address _store) public view returns(
        uint id,address farmer,address transporter,
        string farmer_name, string transporter_name,
        uint date,string product_name,uint quantity
    ){
         store_chain memory s = store_history[_address];
        return(s.id, s.farmer,s.transporter,s.farmer_name,s.transporter_name,s.date,s.product_name,s.quantity)
    }
   
   //runs this ones an account is connected  to know were to render to th  user
    function wallet_identity(address connected_address)public view returns (string memory){
       if(connected_address == owner) return 'admin';
       for (uint256 i = 0; i < farmers.length; i++) {
            if(connected_address == farmers[i])  return 'farmer';
       }
       for (uint256 i = 0; i < transporters.length; i++) {
            if(connected_address == transporters[i]) return 'transporter';
       }
       for (uint256 i = 0; i < store_managers.length; i++) {
            if(connected_address == store_managers[i]) return 'storeManager';
       }
    }
}

    