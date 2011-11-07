package com.miguelinlas3.blogspot.scala.intro.highorderunction.transaction.manager

/**
 * This is a simple class to represent simple transaction management using Scala
 * @author migue
 *
 */
abstract class TransactionManagement(val transactionManager: MockTransactionManager) {

  def transactional[T]()(fun: => T): T = {
    transactionManager.openTransaction
    try {
      fun
    } catch {
      case e => {
        transactionManager.rollback
        throw e
      }
    } finally {
      transactionManager.closeTransaction
    }

  }
}
