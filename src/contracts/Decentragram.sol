pragma solidity ^0.5.0;

contract Decentragram {
  string public name = "Storage";

  //Store Posts
  uint public imageCount = 0;
  mapping(uint => Image) public images;

  struct Image {
    uint id;
    string hash;
    string description;
    uint tipAmount;
    address payable author;
  }

  event ImageCreated(
    uint id,
    string hash,
    string description,
    uint tipAmount,
    address payable author
  );

  event ImageTipped(
    uint id,
    string hash,
    string description,
    uint tipAmount,
    address payable author
  );

  //Create Posts
  function uploadImage(string memory _imgHash, string memory _description) public {
    // Validar que el hash de la imagen exista
    require(bytes(_imgHash).length > 0); 

    // Validar que la descripción este llena
    require(bytes(_description).length > 0); 

    // Validar que la dirección del autor exista
    require(msg.sender != address(0x0)); 

    // Incrementar el imagen id
    imageCount ++;

    // Añadir imagenes del contrato
    images[imageCount] = Image(imageCount, _imgHash, _description, 0, msg.sender);
  

  //Desencadenar eventos
  emit ImageCreated(imageCount, _imgHash, _description, 0, msg.sender);
  }

  //Tipos imagenes
  function tipImageOwner(uint _id)public payable {

    //Validar que la imagen sea visible
    require(_id > 0 && _id <= imageCount);

    //Recuperar la imagen
    Image memory _image = images[_id];

    //Recuperar al autor
    address payable _author = _image.author;

    //Pagar al author con ethers
    address(_author).transfer(msg.value);

    //Incrementar el tipo de recurso
    _image.tipAmount = _image.tipAmount + msg.value;

    //Actualizar la imagen
    images[_id] = _image;

    //Desencadenar el evento
    emit ImageTipped(_id, _image.hash, _image.description, _image.tipAmount, _author);
  }
}