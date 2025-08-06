// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract AgricTech {

    enum Status { AVAILABLE, SHIPPED, DELIVERED }

    struct Farmer {
        uint id;
        address farmerAddress;
        string name;
        string location;
    }

    struct Crop {
        uint id;
        string name;
        uint quantity;
        uint pricePerUnit;
        address payable cropOwner;
        Status cropStatus;
    }

    struct Supply {
        uint id;
        address customerAddress;
        string nameOfProduct;
        uint quantity;
        uint totalCost;
    }

    uint public nextFarmerId;
    uint public nextCropId;
    uint public nextSupplyId;

    uint[] public cropId;
    uint[] public supplyId;
    uint[] public farmerId;

    event CropUploaded(
        uint indexed cropId,
        string name,
        uint quantity,
        uint pricePerUnit,
        address cropOwner
    );

    event CropPurchased(
        uint indexed cropId,
        address indexed buyer,
        uint quantity,
        uint price
    );

    event FarmerRegistered(
        uint indexed farmerId,
        address indexed farmerAddress,
        string name,
        string location
    );
    mapping(address => bool) public registeredFarmers;
    mapping(address => Supply[]) public supplies;
    mapping(uint=> Farmer) public farmers;
    mapping(uint => Crop) public crops;

    function registerFarmer(string memory _name,  string memory _location) public {
        farmers[nextFarmerId] = Farmer({
            id: nextFarmerId,
            farmerAddress: msg.sender,
            name: _name,
            location: _location
        });

        farmerId.push(nextFarmerId);
        registeredFarmers[msg.sender] = true;
        emit FarmerRegistered(nextFarmerId, msg.sender, _name, _location);

        nextFarmerId++;
    }

    function uploadCrop(string memory _name, uint _pricePerUnit, uint _quantity) public {
        crops[nextCropId] = Crop({
            id: nextCropId,
            name: _name,
            quantity: _quantity,
            pricePerUnit: _pricePerUnit,
            cropOwner: payable(msg.sender),
            cropStatus: Status.AVAILABLE
        });

        cropId.push(nextCropId);

        emit CropUploaded(nextCropId, _name, _quantity, _pricePerUnit, msg.sender);

        nextCropId++;
    }

    function buyCrop(uint _cropId, uint quantityToBuy) public payable {
        Crop storage crop = crops[_cropId];
        require(quantityToBuy > 0, "You must buy at least 1 unit");
        require(crop.quantity >= quantityToBuy, "Not enough quantity available");

        uint totalPrice = crop.pricePerUnit * quantityToBuy;
        require(msg.value == totalPrice, "Incorrect ETH sent");

        crop.quantity -= quantityToBuy;

        crop.cropOwner.transfer(msg.value);

        emit CropPurchased(_cropId, msg.sender, quantityToBuy, msg.value);
    }

    function isRegistered (address _address) public view returns (bool){
         return registeredFarmers[_address];
    }
    function recordSupply(
        string memory _nameOfProduct,
        address _customerAddress,
        uint _quantity,
        uint _totalCost
    ) public {
        Supply[] storage supplyList = supplies[msg.sender];
        Supply memory _supply = Supply({
            id: nextSupplyId,
            customerAddress: _customerAddress,
            nameOfProduct: _nameOfProduct,
            quantity: _quantity,
            totalCost: _totalCost
        });

        supplyList.push(_supply);
        supplyId.push(nextSupplyId);
        nextSupplyId++;
    }
function getSupplyCount(address _farmer) public view returns (uint) {
    return supplies[_farmer].length;
}

function getSupplyByIndex(address _farmer, uint index) public view returns (
    uint id,
    address customerAddress,
    string memory nameOfProduct,
    uint quantity,
    uint totalCost
) {
    Supply memory s = supplies[_farmer][index];
    return (s.id, s.customerAddress, s.nameOfProduct, s.quantity, s.totalCost);
}

}
