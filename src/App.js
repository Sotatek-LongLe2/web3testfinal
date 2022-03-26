import "./App.css";

import { useWeb3React } from "@web3-react/core";
import WETH_ABI from "./constants/abis/WETH.json";
import MASTERCHEF_ABI from "./constants/abis/MASTERCHEF.json";
import { MASTERCHEF_ADDRESS, WETH_ADDRESS } from "./constants";
import React, { useEffect, useRef, useState } from "react";
import web3 from "web3";
import { Multicall } from "ethereum-multicall";
import BigNumber from "bignumber.js";
import { callFuncDefine, contractCallContext } from "./data/getData";
import { injected, walletConnect } from "./constants";
import {
  Box,
  Button,
  Input,
  Modal,
  TextField,
  Typography,
} from "@mui/material";

const convertToDecimal = (hex) => {
  return parseInt(hex, 16);
};

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
};

function App() {
  const { account, activate, library } = useWeb3React();
  const [balanceWETH, setBalanceWETH] = useState();
  const [balanceDD2, setBalanceDD2] = useState();
  const [reward, setReward] = useState();
  const [balanceTotalStaked, setBalanceTotalStaked] = useState();
  const [allowance, setAllowance] = useState("0");
  const interval = useRef();
  const [amount, setAmount] = useState();

  let Web3;
  if (library) {
    Web3 = new web3(library.provider);
  }

  const connectContract = (abi, address) => {
    if (Web3) {
      return new Web3.eth.Contract(abi, address);
    }
  };

  const handleClickConnectMetamask = () => {
    activate(injected, undefined, true).catch((e) => {
      console.log(e);
    });
  };

  const handleClickConnectWalletConnect = () => {
    activate(walletConnect, undefined, true).catch((e) => {
      console.log(e);
    });
  };

  const convertData = (key, results) => {
    if (key === "getBalanceTotalStaked") {
      return Web3.utils.fromWei(
        new BigNumber(
          convertToDecimal(
            results[key].callsReturnContext[0].returnValues[0].hex
          )
        ).toFixed(0)
      );
    }

    return Web3.utils.fromWei(
      convertToDecimal(
        results[key].callsReturnContext[0].returnValues[0].hex
      ).toString()
    );
  };

  const stake = async (amount) => {
    await connectContract(MASTERCHEF_ABI, MASTERCHEF_ADDRESS)
      ?.methods.deposit(Web3.utils.toWei(amount))
      .send({ from: account });
    console.log("STAKE SUCCESS");
    console.log(amount);
  };

  const unStake = async (amount) => {
    await connectContract(MASTERCHEF_ABI, MASTERCHEF_ADDRESS)
      ?.methods.withdraw(Web3.utils.toWei(amount.toString()))
      .send({ from: account });
    console.log("UNSTAKE SUCCESS");
  };

  const harvest = async () => {
    await connectContract(MASTERCHEF_ABI, MASTERCHEF_ADDRESS)
      ?.methods.deposit("0")
      .send({ from: account });
    console.log("HARVEST SUCCESS");
  };

  const approve = async () => {
    await connectContract(WETH_ABI, WETH_ADDRESS)
      ?.methods.approve(MASTERCHEF_ADDRESS, Web3.utils.toWei("0.1"))
      .send({ from: account });
    console.log("APPROVE SUCCESS");
  };

  if (Web3) {
    var multicall = new Multicall({
      web3Instance: Web3,
      tryAggregate: true,
    });
  }
  const resultFunc = async () => {
    const { results } = await multicall.call(contractCallContext);
    for (let i in results) {
      switch (i) {
        case callFuncDefine.getBalanceWETH: {
          setBalanceWETH(convertData(i, results));
          break;
        }
        case callFuncDefine.getAllowance: {
          setAllowance(convertData(i, results));
          break;
        }
        case callFuncDefine.getBalanceDD2: {
          setBalanceDD2(convertData(i, results));
          break;
        }

        case callFuncDefine.getBalanceTotalStaked: {
          setBalanceTotalStaked(convertData(i, results));
          break;
        }
        case callFuncDefine.getReward: {
          setReward(convertData(i, results));
          break;
        }
        default: {
          console.log("default");
        }
      }
    }
  };

  const getStaticInfo = () => {
    resultFunc();
  };

  useEffect(() => {
    if (account) {
      interval.current = setInterval(() => {
        getStaticInfo();
        console.log("Loading");
      }, 2000);
    }
    return () => {
      clearInterval(interval.current);
    };
  }, [account, balanceWETH, balanceDD2, reward, balanceTotalStaked]);

  const [open1, setOpen1] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const handleOpen1 = () => setOpen1(true);
  const handleOpen2 = () => setOpen2(true);
  const handleClose1 = () => setOpen1(false);
  const handleClose2 = () => setOpen2(false);

  console.log(amount);
  return (
    <Box
      sx={{
        borderStyle: "solid",
        marginTop: "100px",
        maxWidth: "600px",
        minHeight: "250px",
        display: "flex",
        marginLeft: "500px",
        justifyContent: "center",
      }}
    >
      <Box>
        {account ? (
          <>
            <Box
              sx={{
                minHeight: "400px",
              }}
            >
              <Box
                sx={{
                  fontWeight: "500",
                  fontSize: "18px",
                  mt: "30px",
                }}
              >
                Wallet address: {account}
              </Box>
              <Box
                sx={{ fontWeight: "500", fontSize: "18px", marginTop: "20px" }}
              >
                Balance: {balanceWETH} <b>WETH</b>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box
                  sx={{
                    fontWeight: "500",
                    fontSize: "18px",
                    marginTop: "20px",
                  }}
                >
                  Token Earned: {balanceDD2} <b>DD2</b>
                </Box>
                <Button
                  variant="contained"
                  sx={{
                    fontWeight: "500",
                    fontSize: "14px",
                    marginTop: "20px",
                    width: "100px",
                    height: "30px",
                  }}
                  onClick={harvest}
                >
                  Harvest
                </Button>
              </Box>
              <Box>Allowance: {allowance}</Box>
              {allowance === "0" ? (
                <>
                  <Button
                    sx={{
                      marginTop: "20px",
                      ml: "200px",
                    }}
                    variant="contained"
                    onClick={() => {
                      approve();
                    }}
                  >
                    Approve
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    sx={{ background: "#725CFF", color: "black" }}
                    onClick={handleOpen1}
                  >
                    Deposit
                    <Modal
                      open={open1}
                      onClose={handleClose1}
                      aria-labelledby="modal-modal-title"
                      aria-describedby="modal-modal-description"
                    >
                      <Box sx={style}>
                        <Typography
                          id="modal-modal-title"
                          variant="h6"
                          component="h2"
                        >
                          Stake
                        </Typography>
                        <input
                          value={amount}
                          onChange={(e) => {
                            setAmount(e.target.value);
                          }}
                        />
                        <Box sx={{ mt: "10px", fontSize: "14px" }}>
                          Your WETH balance: {balanceWETH}
                        </Box>
                        <Button
                          sx={{ marginTop: "20px" }}
                          variant="contained"
                          onClick={() => {
                            stake(amount);
                          }}
                        >
                          Stake
                        </Button>
                      </Box>
                    </Modal>
                  </Button>

                  <Button
                    sx={{ background: "#725CFF", color: "black", ml: "20px" }}
                    onClick={handleOpen2}
                  >
                    WithDraw
                  </Button>
                  <Modal
                    open={open2}
                    onClose={handleClose2}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                  >
                    <Box sx={style}>
                      <Typography
                        id="modal-modal-title"
                        variant="h6"
                        component="h2"
                      >
                        Withdraw
                      </Typography>
                      <input
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value);
                        }}
                      />
                      <Box sx={{ mt: "10px", fontSize: "14px" }}>
                        Your WETH deposited: {balanceWETH}
                      </Box>
                      <Button
                        sx={{ marginTop: "20px" }}
                        variant="contained"
                        onClick={() => {
                          unStake(amount);
                        }}
                      >
                        Withdraw
                      </Button>
                    </Box>
                  </Modal>
                </>
              )}

              <Box
                sx={{ fontWeight: "500", fontSize: "18px", marginTop: "20px" }}
              >
                Your stake: {reward} <b>WETH</b>
              </Box>
              <Box
                sx={{ fontWeight: "500", fontSize: "18px", marginTop: "20px" }}
              >
                Total stake: {balanceTotalStaked} <b>WETH</b>
              </Box>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              marginTop: "50px",
              gridGap: "40px",
            }}
          >
            <Button variant="contained" onClick={handleClickConnectMetamask}>
              Connect Metamask
            </Button>
            <Button
              variant="contained"
              onClick={handleClickConnectWalletConnect}
            >
              Connect Wallet Connector
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default App;
