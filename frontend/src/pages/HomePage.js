import React from 'react'

import {
  Box,
  Container,
  Tab,
  Image,
  HStack,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Flex,
  Spacer
} from "@chakra-ui/react";
import Login from '../components/authentication/Login';
import Signup from '../components/authentication/Signup';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';


const HomePage = () => {
  const history = useHistory();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) history.push("/chats");
  }, [history]);


  return (
    <Container maxW="2xl" centerContent>
      <Flex justifyContent="space-between" alignItems="center">
        <Box marginRight="30px" width='50%'>
          <Text
            style={{
              fontSize: 40,
              color: "white",
              fontWeight: 800,
              textShadow: '#FC0 1px 0 10px'
            }}
          >
            WELCOME TO GLOBETALK
          </Text>
        </Box>
        <Box
          bg="#f6f8fa"
          flex="1"
          borderColor="#4b6584"
          minWidth="450px"
          p={7}
          
          borderRadius="2xl"
          borderWidth="2px"
          style={{ marginTop: 30 }}
        >
          <Tabs isFitted variant="soft-rounded" colorScheme="green">
            <TabList>
              <Tab style={{ fontWeight: 800, letterSpacing: 0.5 }}>Login</Tab>
              <Tab style={{ fontWeight: 800, letterSpacing: 0.5 }}>Sign Up</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Login />
              </TabPanel>
              <TabPanel>
                <Signup />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>
    </Container>
  );
}

export default HomePage
