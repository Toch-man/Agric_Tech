// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract FarmToStoreTraceability {
    enum Role {  Farmer, Transporter, Store_manager }
    enum Crop_Status {Pick_Up,In_Transit,Delivered,In_Farm}
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
        string crop_id;
        string name;
        uint quantity;
        uint price_per_unit;
        uint harvestDate;
        address farmer; 
        Crop_Status status;
    }

    struct Deliveries{
        uint id;
        string cropId;
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
        string crop_id;
        string name;
        address owner_address;
        address transporter_address;
        address store_address;
        uint harvestDate;
        uint quantity;
        uint price_per_unit;
        uint arrival_date;
       
    }

    mapping(address => farmer_chain[]) public farmer_history;
    mapping(address => transporter_chain[]) public transporter_history;
    mapping(address => store_chain[]) public store_history;
    mapping(uint => Deliveries) public pendingDeliveries;
    mapping(uint => available_Crop) public crops;
    mapping(uint => PendingRequest) public pendingUsers;
    mapping(address => Role) public roles;
    mapping(uint => product_in_store)public product_inStore;
   
    uint public cropCount;
    uint public deliveryCount;
    uint public store_product_count;
    uint public pending_users_count;
    uint public user_count;

    address public owner;

     mapping(address=> User) public users;
     address[] public all_users;
     address[] public rejected_roles;
     address[] public farmers;
     address[] public transporters;
     address[] public store_managers;
     

    modifier onlyRole(Role role) {
        require(roles[msg.sender] == role, "Access denied");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

      // for store or transporter or farmer to see each other name and adress
    function get_user_name(address _address) public view returns (string memory) {
        return users[_address].name;
    }

    function request_for_role(string memory name, Role role,string memory _location) public {
        
        pending_users_count++;
        pendingUsers[pending_users_count] = PendingRequest(msg.sender,name,_location,role,false,true);
    }
   
function approve_role(uint id) public onlyOwner {
    require(pendingUsers[id].exists, 'no user');
    require(!pendingUsers[id].isApproved, 'already approved');

    PendingRequest storage pending = pendingUsers[id];

    // Create the user
    users[pending.pending_address] = User(
        pending.pending_address,
        pending.name,
        pending.location,
        0,
        pending.requestedRole
    );

    roles[pending.pending_address] = pending.requestedRole;
    if (pending.requestedRole == Role.Farmer) farmers.push(pending.pending_address);
    if (pending.requestedRole == Role.Transporter) transporters.push(pending.pending_address);
    if (pending.requestedRole == Role.Store_manager) store_managers.push(pending.pending_address);

    all_users.push(pending.pending_address);
    user_count++;

    // mark as approved and clear exists but DO NOT decrement global counter
    pending.isApproved = true;
    pending.exists = false;
    // Optional: delete pendingUsers[id];  // you can delete, but do NOT decrement pending_users_count
}

   function reject_role(uint id) public onlyOwner {
    require(pendingUsers[id].exists, 'no such user');
    PendingRequest storage pending = pendingUsers[id];
    pending.isApproved = false;
    pending.exists = false;
    rejected_roles.push(pending.pending_address);
    // do not decrement pending_users_count
}

    
   function resign_user(address _address) public onlyOwner {
    delete users[_address];
    roles[_address] = Role(uint8(0)); // optional: reset role

    // Remove from all_users array
    for (uint i = 0; i < all_users.length; i++) {
        if (all_users[i] == _address) {
            all_users[i] = all_users[all_users.length - 1];
            all_users.pop();
            break;
        }
    }

    user_count--;
}


    //list users count
    function get_user_count() public view returns (uint){
        return user_count;
    }

    function get_user_byAddress(address _address)public view returns(
            address user_address,
            string memory name,
            string memory location,
            uint successful_delivery,
            Role role
    ){
    User memory u = users[_address];
    return (u.user_address,u.name, u.location,u.successful_delivery,u.role);
    }
    
    //returns false if role is rejected
    function check_application_result(address _address)public view returns (bool) {
        for (uint256 i = 0; i < rejected_roles.length; i++) {
            if(_address == rejected_roles[i]) return false;
        }
        return true;
    }

    // Farmer Register Crop
    function registerCrop(string memory name,string memory product_id, uint quantity,uint _price, uint harvestDate)
        public
        onlyRole(Role.Farmer)
    {
          cropCount++;
        crops[cropCount] = available_Crop({
            id: cropCount,
            crop_id:product_id,
            name: name,
            quantity: quantity,
            price_per_unit:_price,
            harvestDate: harvestDate,
            farmer: msg.sender,
            status: Crop_Status.In_Farm
        });
    }

    //when farmer clicks deliver  run this function
function send_to_transporter(uint id, uint _quantity, address _store, address transporter) public onlyRole(Role.Farmer){
    available_Crop storage crop = crops[id];
    require(crop.farmer == msg.sender, "Not your crop");
    

    crop.status = Crop_Status.Pick_Up;
    
    deliveryCount++;
    pendingDeliveries[deliveryCount] = (Deliveries({
        id:deliveryCount,
        cropId:crop.crop_id,
        name:crop.name,
        farmer:msg.sender,
        transporter:transporter,
        store:_store,
        pick_up_location: users[msg.sender].location,
        destination: users[_store].location,
        quantity:_quantity,
        status:Crop_Status.Pick_Up  
    }));
}

    //when the transporter click deliver button
    function product_inTransit(uint id)public onlyRole(Role.Transporter){
        Deliveries storage Dc = pendingDeliveries[id];
        available_Crop storage crop = crops[id];
        crop.status= Crop_Status.In_Transit;
        Dc.status=Crop_Status.In_Transit;
    }

    // store manager confirm delivery
    function confirmArrival(uint cropId, uint arrival_date)
        public
        onlyRole(Role.Store_manager)
    {
        require(cropId > 0 && cropId <= deliveryCount, "Invalid crop ID");
        store_product_count++;
       
        Deliveries storage delivery_crop = pendingDeliveries[cropId];
        available_Crop storage crop= crops[delivery_crop.id];
      
         crop.status = Crop_Status.Delivered;
         delivery_crop.status = Crop_Status.Delivered;
         delivery_crop.status = Crop_Status.Delivered;
    
        users[msg.sender].successful_delivery += 1;
        users[delivery_crop.transporter].successful_delivery +=1;
        users[delivery_crop.farmer].successful_delivery +=1;
        product_inStore[store_product_count] = product_in_store({
            crop_id:delivery_crop.cropId,
            name:delivery_crop.name,
            owner_address:delivery_crop.farmer,
            transporter_address:delivery_crop.transporter,
            store_address:msg.sender,
            harvestDate: crop.harvestDate,
            quantity: delivery_crop.quantity,
            price_per_unit:crop.price_per_unit,
            arrival_date:arrival_date
        });
        

        farmer_history[delivery_crop.farmer].push(farmer_chain({
            id:farmer_history[delivery_crop.farmer].length+1,
            farmer:delivery_crop.farmer,
            product_name:delivery_crop.name,
            sent_to: users[delivery_crop.store].name,
            store:delivery_crop.store,
            through:users[delivery_crop.transporter].name,
            transporter:delivery_crop.transporter,
            date:arrival_date
        }));

        transporter_history[delivery_crop.transporter].push(transporter_chain({
              id:transporter_history[delivery_crop.transporter].length + 1,
             farmer:delivery_crop.farmer,
             store:delivery_crop.store,
             farmer_name:users[delivery_crop.farmer].name,
             store_name: users[delivery_crop.store].name,
             crop_name:delivery_crop.name,
             from:delivery_crop.pick_up_location,
             to:delivery_crop.destination,
             date:arrival_date
        }));

        store_history[msg.sender].push(store_chain({
            id:store_history[msg.sender].length+1,
            farmer:delivery_crop.farmer,
            transporter:delivery_crop.transporter,
            farmer_name:users[delivery_crop.farmer].name,
            transporter_name:users[delivery_crop.transporter].name,
            date:arrival_date,
            product_name:delivery_crop.name,
            quantity:delivery_crop.quantity
        }));
      
    }

    //retruns array  of address for a specific role 
    //likely  to be shown in a drop menu to fetch name using the address
    function list_user_address(Role role) public view returns (address[] memory){
        if(role== Role.Farmer)return farmers;
        if (role == Role.Transporter) return transporters;
        if(role == Role.Store_manager) return store_managers;
        address[] memory empty;
         return empty;
    }  

    function get_delivery_count()public view returns(uint){
       return deliveryCount;
    }

    function get_delivery_byIndex( uint crop_id)public view returns(
        uint id,
        string memory cropId,
        string memory name,
        address farmer,
        address transporter,
        address store,
        string memory pick_up_location,
        string memory destination,
        uint quantity,
        Crop_Status status
    ){
        Deliveries memory d = pendingDeliveries[crop_id];
        return (d.id,d.cropId, d.name,d.farmer,d.transporter,d.store,d.pick_up_location,d.destination,d.quantity,d.status);
    }

    //to get crop count inorder to use in the getcrop by index
    function crop_count() public view returns (uint) {
        return cropCount;
    }
    function get_crop_byIndex( uint cropId) public view returns(
        uint id, string memory crop_id,string memory name,uint quantity,uint harvestDate, uint price_per_unit, address farmer, Crop_Status status){
        available_Crop memory c= crops[cropId];
        return (c.id,c.crop_id,c.name,c.quantity,c.harvestDate,c.price_per_unit,c.farmer,c.status);
    }

    function get_store_product_count()public view returns(uint){
        return store_product_count;
    }

    function get_product_byIndex(uint product_id)public view returns(
        string memory crop_id,
        string memory name,
        address owner_address,
        address transporter_address,
        address store_address,
        uint harvestDate,
        uint quantity,
        uint price_per_unit,
        uint arrival_date
    ){
        product_in_store memory p = product_inStore[product_id];
        return( 
        p.crop_id,p.name,p.owner_address,
        p.transporter_address,p.store_address 
        ,p.harvestDate,p.quantity,p.price_per_unit,
        p.arrival_date);
    }

    //to show scan result
    function get_product_byCropId(string memory _crop_id) 
    public 
    view 
    returns (
        string memory crop_id,
        string memory name,
        address owner_address,
        address transporter_address,
        address store_address,
        uint harvestDate,
        uint quantity,
        uint price_per_unit,
        uint arrival_date
    ) 
{
    for (uint i = 1; i <= store_product_count; i++) {
        if (keccak256(bytes(product_inStore[i].crop_id)) == keccak256(bytes(_crop_id))) {
            product_in_store memory p = product_inStore[i];
            return (
                p.crop_id,
                p.name,
                p.owner_address,
                p.transporter_address,
                p.store_address,
                p.harvestDate,
                p.quantity,
                p.price_per_unit,
                p.arrival_date
            );
        }
    }
    revert("Product not found");
}
       
           // Get total number of pending role requests
    function get_pending_request_count() public view returns (uint) {
        return pending_users_count;
    }

    // Get a specific pending request by index (id)
    function get_pending_request_byIndex(uint id) 
        public 
        view 
        returns (
            address pending_address,
            string memory name,
            string memory location,
            Role requestedRole,
            bool isApproved,
            bool exists
        ) 
    {
        require(id > 0 && id <= pending_users_count, "Invalid pending request ID");
        PendingRequest memory p = pendingUsers[id];
        return (
            p.pending_address,
            p.name,
            p.location,
            p.requestedRole,
            p.isApproved,
            p.exists
        );
    }


    function get_history_count(address _user, Role _role) public view returns (uint) {
    if (_role == Role.Farmer) return farmer_history[_user].length;
    if (_role == Role.Transporter) return transporter_history[_user].length;
    if (_role == Role.Store_manager) return store_history[_user].length;
    return 0;
    }

    function get_farmer_history_byIndex(address _farmer, uint index) public view returns(  uint id,address farmer,string memory product_name,
        string memory sent_to,address store,string memory through,
        address transporter,uint date) {
    require(index < farmer_history[_farmer].length, "Index out of bounds");
    farmer_chain memory f = farmer_history[_farmer][index];
    return ( f.id,f.farmer,f.product_name,f.sent_to,f.store,f.through,f.transporter,f.date);
    }

    
     function get_transporter_history_byIndex(address _transporter, uint index)public view returns(
         uint id,address farmer, address store,
        string memory farmer_name,string memory store_name,string memory crop_name,
        string memory from, string memory to, uint date
    ){
        transporter_chain memory t = transporter_history[_transporter][index];
        return ( t.id,t.farmer,t.store,t.farmer_name,t.store_name,t.crop_name,t.from,t.to,t.date);
    }


    function get_store_history_byIndex(address _store, uint index) public view returns(
        uint id,address farmer,address transporter,
        string memory farmer_name, string memory transporter_name,
        uint date,string memory product_name,uint quantity
    ){
         store_chain memory s = store_history[_store][index];
        return(s.id, s.farmer,s.transporter,s.farmer_name,s.transporter_name,s.date,s.product_name,s.quantity);
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
       return 'none';
    }

    // total number of registered users
    function get_all_users_count() public view returns (uint) {
        return all_users.length;
    }

    // get a single user by index
    function get_user_byIndex(uint index)
        public
        view
        returns (
        address user_address,
        string memory name,
        string memory location,
        uint successful_delivery,
        Role role
    )
    {
    require(index < all_users.length, "wrong index");
    address uAddr = all_users[index];
    User memory u = users[uAddr];
    return (u.user_address, u.name, u.location, u.successful_delivery, u.role);
    }
}



    