// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title LotteryPool
 * @dev Smart contract para gestionar depósitos y pagos de lotería descentralizada
 */
contract LotteryPool {
    address public owner;
    uint256 public monthlyAmount;
    uint256 public maxParticipants;
    
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public totalDeposited;
    address[] public participants;
    
    event Deposit(address indexed user, uint256 amount, uint256 timestamp);
    event WinnerPaid(address indexed winner, uint256 amount, uint256 round);
    event GroupCreated(uint256 monthlyAmount, uint256 maxParticipants);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    constructor(uint256 _monthlyAmount, uint256 _maxParticipants) {
        owner = msg.sender;
        monthlyAmount = _monthlyAmount;
        maxParticipants = _maxParticipants;
        emit GroupCreated(_monthlyAmount, _maxParticipants);
    }
    
    /**
     * @dev Permite a un usuario depositar fondos
     */
    function deposit() external payable {
        require(msg.value == monthlyAmount, "Incorrect amount");
        require(participants.length < maxParticipants, "Group is full");
        
        deposits[msg.sender] += msg.value;
        totalDeposited[msg.sender] += msg.value;
        
        // Solo agregar si es nuevo participante
        bool isNewParticipant = true;
        for (uint i = 0; i < participants.length; i++) {
            if (participants[i] == msg.sender) {
                isNewParticipant = false;
                break;
            }
        }
        
        if (isNewParticipant) {
            participants.push(msg.sender);
        }
        
        emit Deposit(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev Paga el premio al ganador del mes
     * @param winner Dirección del ganador
     * @param round Número de ronda
     */
    function payWinner(address winner, uint256 round) external onlyOwner {
        uint256 prize = address(this).balance;
        require(prize > 0, "No funds available");
        require(winner != address(0), "Invalid winner address");
        
        (bool success, ) = payable(winner).call{value: prize}("");
        require(success, "Transfer failed");
        
        emit WinnerPaid(winner, prize, round);
    }
    
    /**
     * @dev Obtiene el balance del contrato
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Obtiene el número de participantes
     */
    function getParticipantCount() external view returns (uint256) {
        return participants.length;
    }
    
    /**
     * @dev Obtiene el depósito total de un usuario
     */
    function getUserDeposit(address user) external view returns (uint256) {
        return totalDeposited[user];
    }
}
