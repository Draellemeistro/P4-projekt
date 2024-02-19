# P4 projekt, AAU CCT4 (PLACEHOLDER / TEMPLATE)
## Theme: Security in Application Development
### nogle ting at kigge på
#### Artikler
1.  [How to make a secure messaging app](https://www.amplework.com/blog/how-to-make-a-secure-messaging-app/)
2. [Developing a real-time secure chat application like WhatsApp & Signal with end-to-end encryption.](https://www.qed42.com/insights/developing-a-real-time-secure-chat-application-like-whatsapp-signal-with-end-to-end-encryption)
3. [Build an End-to-End Encrypted Chat with Seald and PubNub](https://www.pubnub.com/blog/build-an-end-to-end-encrypted-chat-with-seald-and-pubnub/)
4. [How encrypted messaging changed the way we protest](https://cybernews.com/news/how-encrypted-messaging-changed-the-way-we-protest/)
5. [What is AES encryption and how does it work?](https://cybernews.com/resources/what-is-aes-encryption/)
6. [Python chat](https://github.com/ludvigknutsmark/python-chat)
7. [A Cryptographer's Guide to End-to-End Encryption](https://hackernoon.com/a-cryptographers-guide-to-end-to-end-encryption?ref=hackernoon.com)
8. [60 Stories To Learn About Compliance](https://hackernoon.com/60-stories-to-learn-about-compliance?ref=hackernoon.com)

   
#### Lign. produkter
- Signal
- Telegram
- WhatsApp
- Wickr Me
- Wire - Secure Messenger

#### Redskaber, ting at kigge på etc.
- AES-256
- Extended Triple Diffie-Hellman
- Elliptic Curve Diffie-Hellman
- Double Ratchet
- Sesame protocols
- SPN (substitution permutation network)
- 


##### send data
1. **Refresh Webpage**
2. **HTTP protocol**
3. **HTTP 1.1 Keep-Alive Protocol**
4. **Short Polling**
5. **Long Polling**
6. **Server-Sent Events**
4, 5, 6: [Polling vs SSE vs WebSocket— How to choose the right one](https://codeburst.io/polling-vs-sse-vs-websocket-how-to-choose-the-right-one-1859e4e13bd9)
1(?), 2, 3: [HTTP Request/Response Cycle](https://backend.turing.edu/module2/lessons/how_the_web_works_http#:~:text=The%20Request%20and%20Response%20Cycle&text=When%20the%20server%20receives%20that,be%20rendered%20to%20the%20user.) og [Building Real-Time Applications with WebSockets](https://frontend.turing.edu/lessons/module-4/websockets.html)

##### Features
- **Open source protocol**
- **Encrypted messages** / **End-to-end encryption** / **Device-to-device encryption**
- **Passcode and Touch ID protection.**
- **Screen capture blocking.**
- **Timed conversations.**

  
### Requirements / Outline:
- The project involves analyze and implementation of cyber solution to secure data transmission between users (remotely) at the network level

- The application should mimic a real-world problem where security is essential

- The application should involve data exchange between users, user-server, user-database

- Example of exchanged data is log-in information from the user (data that must be secured, private data, payment, info about personal number, …., etc.)

- It could be desktop or web application

  
#### What needs to be covered?
- `Definition and analysis of the problem:` 
	- Define a concrete use-case that involves security challenges
	- Identify and analyze potential security vulnerabilities (e.g., cyber fraud, data breaches, unauthorized access)
- `Security Solution:`
	- Implement a security solution to prevent the identified potential threats of the application
	- The security mechanism must cover Input validation
	- In addition, at minimum 1 extra security mechanism (multifactor authentication for login, secure session management, access control)
	- Make different analyses of how to secure the data, and select the best based on your project
	- Test and evaluate the implemented solution by simulating cyber attacks
- `Data Communication:`
	- Define the communication protocol(s) used in your project (HTTP, TCP, UDP, ….)
	- Use a platform for sniffing the data, i.e., capture and analyze the network traffic (e.g., detecting anomalies or test your developed security mechanism)
- `UML and Scrum`
	- Use again UML, SCRUM in your work, analyses, and design
	- With respect to UML it is a good idea to extend the normal UML use cases with ”dark use cases” where you investigate different attacks and let that guide the selection of security mechanisms

 ![image](https://github.com/Draellemeistro/P4-projekt/assets/117720444/94c9776e-bf5e-435b-b33d-194197c4d28d)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

```
Give examples
```

### Installing

A step by step series of examples that tell you how to get a development env running

Say what the step will be

```
Give the example
```

And repeat

```
until finished
```

End with an example of getting some data out of the system or using it for a little demo

## Running the tests

Explain how to run the automated tests for this system

### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

### And coding style tests

Explain what these tests test and why

```
Give an example
```

## Deployment

Add additional notes about how to deploy this on a live system

## Built With

* [Dropwizard](http://www.dropwizard.io/1.0.2/docs/) - The web framework used
* [Maven](https://maven.apache.org/) - Dependency Management
* [ROME](https://rometools.github.io/rome/) - Used to generate RSS Feeds

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Billie Thompson** - *Initial work* - [PurpleBooth](https://github.com/PurpleBooth)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to anyone whose code was used
* Inspiration
* etc
