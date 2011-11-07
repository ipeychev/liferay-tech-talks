package com.miguelinlas3.blogspot.scala.intro.highorderunction.transaction.manager

class MockTransactionManager {

	def openTransaction(): Unit = {
		println ("Opening transaction")
	}
	
	def closeTransaction(): Unit = {
		println("Closing transaction");
	}
	
	def rollback(): Unit = {
		println("Roll back previous work");
	}
	
	def commit(): Unit = {
		println("Commiting the work");
	}
}