import {useRef} from "react";
import {Form, Button} from "react-bootstrap";
import { socket } from "../socket";

const LoginForm = ({onSubmit, setBoardInfo}) => {
    const usernameRef = useRef("");
    const userInfo = {
        userId: sessionStorage.getItem("userId"),
        username: usernameRef.current.value,
        room: sessionStorage.getItem("room"),
    }

    const connect = (e) => {
        e.preventDefault();
        onSubmit(true);
        socket.io.on("error", (error) => {
            console.error(error);
        })
        socket.connect();
        console.log(socket.connected);
        onJoinRoom();
    }

	const disconnect = (e) => {
		e.preventDefault();
		socket.disconnect();
		sessionStorage.removeItem("roomId");
		sessionStorage.removeItem("userId");
		onSubmit();
	}

    const onJoinRoom = () => {
		console.log(userInfo.username);
        socket.emit("user-join", (res) => {
            sessionStorage.setItem("roomId", res.room);
            sessionStorage.setItem("userId", res.uuid);
            sessionStorage.setItem("username", userInfo.username);
        });
    }
    

    return (
      <>
        <div className="container d-flex flex-column justify-content-center align-items-center">
            <div className="img-container">
                <img src="../public/logo awebo.png" alt="awebo logo" style={{width: "200px"}}/>
            </div>
            <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Control placeholder="Enter your player name" ref={usernameRef}/>
                </Form.Group>
                <Button variant="primary" onClick={(e) => connect(e)}>
                    Join Room
                </Button>
				<Button variant="secondary" onClick={(e) => disconnect(e)}>
                    Leave Room
                </Button>
            </Form>
        </div>
    </>
    )
}

export default LoginForm