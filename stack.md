1-stack.md (Choose either stack or queue)
•	Introduction to Stack
Definition and Characteristics
- Last In, First Out (LIFO): The last element added to the stack will be the first one to be removed.
- Operations: Main operations include `push`, `pop`, `peek`, and `isEmpty`.

•	Use Cases and Importance

- Memory Management: Stacks play a crucial role in memory allocation and execution call stacks in programming languages.
- Undo Mechanisms: Used in editors for undoing actions, navigating back in browsers, etc.
- Syntax Parsing: Compilers use stacks for syntax checking and parsing.

Operations on Stack
•	- Push: Adds an item to the top of the stack.
•	- Pop: Removes the item from the top of the stack.
•	- Peek: Returns the item at the top of the stack without removing it.
•	- isEmpty: Checks if the stack is empty.

Implementing a Stack in Python
o	Using lists
Python lists naturally support stack operations with append() for push and pop().
o	Creating a stack class
The provided example code demonstrates a simple stack implementation using Python's list as the underlying storage mechanism
•	Performance Analysis
o	Push: O(1) - Constant time complexity as adding to the end of a list
o	Pop: O(1) - Constant time complexity for removing the last item of a list
o	Peek: O(1) - Accessing the last item is constant time
o	isEmpty: O(1) - Checking if a list is empty is also constant time
•	Common Errors and Pitfalls
Stack Overflow: Occurs when too many items are pushed onto the stack, exceeding its capacity
Underflow: Trying to pop from an empty stack

•	Example Problem Solved Using a Stack
Given a sequence of parentheses, brackets, and braces, write a function that returns True if the sequence is balanced and False otherwise.

Solution
A detailed solution will be provided in a separate Python file linked here.

•	Exercise for the Student
o	Problem statement
Implement a function that reverses a string using a stack
o	Link to the solution (in a separate Python file)
o	I will provide a link.
•	Navigation Link Back to Welcome Page
I will provide a link.
