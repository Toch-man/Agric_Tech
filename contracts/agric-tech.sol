// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract FarmToStoreTraceability {
    enum Role { None, Farmer, Transporter, Retailer }
    enum Crop_Status { Pick_Up,In_Transit,Delivered}
    struct User {
        address user_address;
        Role role;
        bool isApproved;
    }

    struct PendingRequest {
        address pending_address;
        Role requestedRole;
        bool exists;
    }

    struct Crop {
        uint id;
        string name;
        uint quantity;
        uint harvestDate;
        address farmer;
        address retailer;
        bool delivered;
    }

    struct send_to_transporters{
        uint id;
        string name;
        address farmer;
        string pick_up_location;
        string destination;
        Crop_Status status;
    }

    struct LocationUpdate {
        uint timestamp;
        string location;
    }    

    mapping(uint => send_to_transporters) public pendingDeliveries;
    mapping(uint => Crop) public crops;
    mapping(uint => LocationUpdate[]) public transportHistory;
    mapping(uint=> User) public users;
    mapping(uint => PendingRequest) public pendingUsers;
    mapping(address => Role) public roles;

    uint public crop_in_transportCount;
    uint public cropCount;
    uint public requestCount;
    address public owner;

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


    function request_for_role( Role role) public {
        
        require(!pendingUsers[requestCount].exists,'already requested');
        require(role != Role.None ,'invalid role');
        require(!users[requestCount].isApproved,'request already approved');

        pendingUsers[requestCount] = PendingRequest(msg.sender,role,true);
        requestCount++;
    }

    function approve_role(uint requested_id)public{
        require(pendingUsers[requested_id].exists,'no such user');
        require(!users[requested_id].isApproved,'request already approved');
        PendingRequest memory pending = pendingUsers[requested_id];
        users[requested_id] = User(pending.pending_address,pending.requestedRole,true);
        delete pendingUsers[requested_id];
    }

    function reject_role(uint requested_id) public {
         require(pendingUsers[requested_id].exists,'no such user');
        require(!users[requested_id].isApproved,'request already approved');
        delete pendingUsers[requested_id];
    }
    function assignRole(address user, Role role) public onlyOwner {
        roles[user] = role;
    }

    // --- Farmer: Register Crop ---
    function registerCrop(string memory name, uint quantity, uint harvestDate)
        public
        onlyRole(Role.Farmer)
    {
        cropCount++;
        crops[cropCount] = Crop({
            id: cropCount,
            name: name,
            quantity: quantity,
            harvestDate: harvestDate,
            farmer: msg.sender,
            retailer: address(0),
            delivered: false
            
        });
    }

    function send_to_transporters(string memory _name, string memory _pick_up_location, string memory _destination) public onlyRole(Role.Farmer){
        crop_in_transportCount++;
        pendingDeliveries[crop_in_transportCount]= send_to_transporters({
            id:crop_in_transportCount,
            name:_name,
            famrmer:msg.sender,
            pick_up_location:_pick_up_location,
            destination:_destination,
            status:Crop_Status.Pick_Up,
        })

    }

    // --- Transporter: Update Location ---
    function updateLocation(uint cropId, string memory location)
        public
        onlyRole(Role.Transporter)
    {
        require(cropId > 0 && cropId <= cropCount, "Invalid crop ID");
        transportHistory[cropId].push(LocationUpdate({
            timestamp: block.timestamp,
            location: location
        }));
    }

    // --- Retailer: Confirm Arrival ---
    function confirmArrival(uint cropId)
        public
        onlyRole(Role.Retailer)
    {
        require(cropId > 0 && cropId <= cropCount, "Invalid crop ID");
        Crop storage crop = crops[cropId];
        crop.delivered = true;
        crop.retailer = msg.sender;
    }

    // --- Public: View Details ---
    function getCropDetails(uint cropId)
        public
        view
        returns (Crop memory)
    {
        return crops[cropId];
    }

    function getTransportHistory(uint cropId)
        public
        view
        returns (LocationUpdate[] memory)
    {
        return transportHistory[cropId];
    }
}


// contract AgricTech {

//     enum Status { AVAILABLE, SHIPPED, DELIVERED }

//     struct Farmer {
//         uint id;
//         address farmerAddress;
//         string name;
//         string location;
//     }

//     struct Crop {
//         uint id;
//         string name;
//         uint quantity;
//         uint pricePerUnit;
//         address payable cropOwner;
//         Status cropStatus;
//     }
//     struct Product_list {
//         uint id;
//         string name;
//         address ownerAddress;
//         uint price;
//     }
//     struct Supply {
//         uint id;
//         address customerAddress;
//         string nameOfProduct;
//         uint quantity;
//         uint totalCost;
//     }

//     uint public nextFarmerId;
//     uint public nextCropId;
//     uint public nextSupplyId;

//     uint[] public cropId;
//     uint[] public supplyId;
//     uint[] public farmerId;
//     uint[] public product_listId;
//     Product_list[] public products;

//     event CropUploaded(
//         uint indexed cropId,
//         string name,
//         uint quantity,
//         uint pricePerUnit,
//         address cropOwner
//     );
//     event new_crop_added(
//         uint indexed product_listId,
//         string name,
//         address ownerAddress,
//         uint price
//     );

//     event CropPurchased(
//         uint indexed cropId,
//         address indexed buyer,
//         uint quantity,
//         uint price
//     );

//     event FarmerRegistered(
//         uint indexed farmerId,
//         address indexed farmerAddress,
//         string name,
//         string location
//     );
//     mapping(address => bool) public registeredFarmers;
//     mapping(address => Supply[]) public supplies;
//     mapping(uint=> Farmer) public farmers;
//     mapping(uint => Crop) public crops;
   


//     function registerFarmer(string memory _name,  string memory _location) public {
//         farmers[nextFarmerId] = Farmer({
//             id: nextFarmerId,
//             farmerAddress: msg.sender,
//             name: _name,
//             location: _location
//         });

//         farmerId.push(nextFarmerId);
//         registeredFarmers[msg.sender] = true;
//         emit FarmerRegistered(nextFarmerId, msg.sender, _name, _location);

//         nextFarmerId++;
//     }

//     function uploadCrop(string memory _name, uint _pricePerUnit, uint _quantity) public {
//         crops[nextCropId] = Crop({
//             id: nextCropId,
//             name: _name,
//             quantity: _quantity,
//             pricePerUnit: _pricePerUnit,
//             cropOwner: payable(msg.sender),
//             cropStatus: Status.AVAILABLE
//         });

//         products.push(Product_list({
//             id:nextCropId,
//             name: _name,
//             ownerAddress:msg.sender,
//             price: _pricePerUnit
//         }));

//         cropId.push(nextCropId);
//         product_listId.push(nextCropId);

//         emit new_crop_added(nextCropId, _name,msg.sender,_pricePerUnit);
       
//         emit CropUploaded(nextCropId, _name, _quantity, _pricePerUnit, msg.sender);

//         nextCropId++;
//     }

//     function buyCrop(uint _cropId, uint quantityToBuy) public payable {
//         Crop storage crop = crops[_cropId];
//         require(quantityToBuy > 0, "You must buy at least 1 unit");
//         require(crop.quantity >= quantityToBuy, "Not enough quantity available");

//         uint totalPrice = crop.pricePerUnit * quantityToBuy;
//         require(msg.value >= totalPrice, "Insufficient celo sent");

//         crop.quantity -= quantityToBuy;

//         crop.cropOwner.transfer(msg.value);

//         emit CropPurchased(_cropId, msg.sender, quantityToBuy, msg.value);
//     }

//     function isRegistered (address _address) public view returns (bool){
//          return registeredFarmers[_address];
//     }
//     function recordSupply(
//         string memory _nameOfProduct,
//         address _customerAddress,
//         uint _quantity,
//         uint _totalCost
//     ) public {
//         Supply[] storage supplyList = supplies[msg.sender];
//         Supply memory _supply = Supply({
//             id: nextSupplyId,
//             customerAddress: _customerAddress,
//             nameOfProduct: _nameOfProduct,
//             quantity: _quantity,
//             totalCost: _totalCost
//         });

//         supplyList.push(_supply);
//         supplyId.push(nextSupplyId);
//         nextSupplyId++;
//     }
// function getSupplyCount(address _farmer) public view returns (uint) {
//     return supplies[_farmer].length;
// }

// function getSupplyByIndex(address _farmer, uint index) public view returns (
//     uint id,
//     address customerAddress,
//     string memory nameOfProduct,
//     uint quantity,
//     uint totalCost
// ) {
//     Supply memory s = supplies[_farmer][index];
//     return (s.id, s.customerAddress, s.nameOfProduct, s.quantity, s.totalCost);
// }

// function get_product_count() public view returns (uint){
//     return  products.length;
// }

// function get_product_by_index(uint index) public view returns(
//         uint id,
//         string memory name,
//         address ownerAddress,
//         uint price
//         ){
//             Product_list memory p = products[index];
//             return (p.id,p.name,p.ownerAddress,p.price);
//         }
// }
