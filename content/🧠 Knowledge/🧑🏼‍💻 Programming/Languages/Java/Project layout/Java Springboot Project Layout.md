---
title: Java Springboot Project Layout
tags:
  - java
  - springboot
  - project-layout
---
## Creating the project
When creating a Java Sprinboot application, I start with [Spring Initializr](https://start.spring.io/) and pick `Gradle - Groovy` as the the dependency manager, with Java as the language (obviously). I'll usually select the latest stable versions for everything, package it in Jar, and then select core dependencies I'll need. These dependencies are usually things like:
- Spring Boot DevTools
- Lombok
- Spring Web **or** Spring Reactive Web
- Spring Data JPA & the respective DB driver (e.g. PostgreSQL Driver)
- Any other necessary dependencies in the list. ( e.g WebSocket, OAuth2 Client)

After generating the project and creating the git repository, I'll add any further dependencies. If building a backend application then I'd us something like Swagger 
## Folder structure
When structuring a Java Springboot project, I prefer to go with a layered approach
- **src/**
	- **main/**
		- **java/\<etc>/\<app-name>/**
			- [[#Config|config/]]
			- [[#Controllers|controller/]]
			- [[#Dto (Data Transfer Object)|dto/]]
				- **requests/**
				- **responses/**
			- [[#Entity|entity/]]
			- [[#Exception|exception/]]
				- **exceptions/**
				- **handlers/**
			- [[#Mapper|mapper/]]
			- [[#Repository|repository/]]
			- [[#Service|service/]]
				- [[#Api|api/]]
			- [[#Util|util/]]
		- **resources/**
			- **application.yml**
	- **test/**
		- *mirrors the structure of main*
### Config
The config folder contains configuration classes, annotated with `@Configuration`, that define beans that can be used throughout the program. For example, one might setup a default `RestClient` configuration:
```java
@Configuration
public class RestClientConfig {

	@Bean
	public RestClient defaultRestClient(RestClient.Builder builder) {
		return builder
			.baseUrl("http://example.com:8080/api/v1")
			.build();
	}
}
```
This could then be used throughout the code like so

```java
@Service
@RequiredArgsConstructor
public class MyService {

	private final RestClient restClient;

	public String fetchData() {
		return restClient.get()
			.uri("/data") // Resolves to http://example.com:8080/api/v1/data
			.retrieve()
			.body(String.class);
  }
}
```
### Controller
The controller folder contains all the controllers, defined with `@RestController`. These serve as the entry points to the web application, handling HTTP requests and delegating logic to the service layer. E.g.:
```java
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;

	@GetMapping("/{id}")
	public ResponseEntity<UserDto> getUser(@PathVariable Long id) {
		return ResponseEntity.ok(userService.getUserById(id));
	}
}
```
### Dto (Data Transfer Object)
The dto folder contains DTO classes that define the request and response objects for the APIs. These are separated into a requests & responses folder. When using swagger, the descriptions and examples are added here. For example:
```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {

	@Schema(description = "The ID of the user", example = "3")
	private Long id;

	@Schema(description = "The user's name", example = "0xREDACTED")
	private String name;

	@Schema(description = "the user's email", example = "redacted@example.com")
	private String email;
}
```
### Entity
The entity folder contains the JPA entities that map to database tables, annotated with `@Entity` and `@Table`:
```java
@Entity
@Table(name = "user")
@Data
public class User {
    
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotNull
	private String name;
  
	@NotNull
	private String email;
}
```
### Exception
Contains custom exception classes and global exception handlers. For example, an exception:
```java
public class UserNotFoundException extends RuntimeException {
	public UserNotFoundException(Long id) {
		super("User not found with ID: " + id);
	}
}
```
And an exception handler:
```java
@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(UserNotFoundException.class)
	public ResponseEntity<String> handleUserNotFoundException(UserNotFoundException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
	}
}
```
### Mapper
Contains classes that map between DTOs and entities, typically using MapStruct (the following is a very simple example):
```java
@Mapper
public interface UserMapper {
	UserDto toDto(User user);
	User toEntity(UserDto userDto);
}
```
### Repository
The repository layer is responsible for interacting with the underlying database. I prefer to split it into [[#JPA Repository|jpa]] for standard CRUD operations and [[#DAO (Data Access Object)|dao]] for more custom & complex operations
#### JPA Repository
Most of the time, I will just make use of JPA repositories when interacting with data in the database. For example:
```java
@Repository
public interface UserRepositoryJpa extends JpaRepository<User, Long> {
}
```
That way I can do simple things like `userRepositoryJpa.findById(id)`
#### DAO (Data Access Object)
Sometimes, I'll need to perform more complex queries that go beyond the what can be achieved with the `JpaRepository`. In this case, the DAO classes will interact with the `EntityManager` directly.

For example, the following makes use of the `HAVING` clause in native SQL, which can't be achieved when using `@Query` in the `JpaRepository`
```java
@Repository
@RequiredArgsConstructor
public class UserDao {

	private final EntityManager entityManager;

  public List<User> findUsersWithMoreThanNTasks(int taskCount) {
	  String sql = "SELECT u.* FROM user u " +
								 "JOIN task t ON u.id = t.user_id " +
								 "GROUP BY u.id " +
								 "HAVING COUNT(t.id) > :taskCount";
								 
		Query query = entityManager.createNativeQuery(sql, User.class);
		query.setParameter("taskCount", taskCount);

		return query.getResultList();
	}
}
```

### Service
The service layer is where the business logic of the application lives, annotated with `@Service`. This is also where `@Transactional` would be used when interacting with the repository layer. E.g:
```java
@Service
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;
	private final TaskRepository taskRepository;

  @Transactional
  public User createUserWithTask(String userName, String taskDescription) {
		User newUser = new User();
		newUser.setName(userName);
		userRepository.save(newUser);

		Task newTask = new Task();
		newTask.setDescription(taskDescription);
		newTask.setUser(newUser);
		taskRepository.save(newTask);
      
		return newUser;
	}
}
```
#### Api
The `api/` subfolder within `service/` is my preferred place to place service level classes, with a `@Service` annotation, that interact with external APIs. This way, there is a separation between these and the services that interact with repositories. Also, the services that interact with repositories can call these ones in their business logic. 

A good example of this is back in [[#Config]], where RestClient is used to grab data from an external API.
### Util
This folder contains helper classes, utility functions, and constants. These are static classes with static methods. As a simple example:
```java
public class DateUtils {
	private DateUtils() {}
	
	public static String formatDate(LocalDateTime dateTime) {
		return dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
	}
}
```