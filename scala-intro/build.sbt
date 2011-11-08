
// Set the project name
name := "scala-intro"

description := "Scala intro"

version := "0.1"

libraryDependencies ++= Seq(
    "se.scalablesolutions.akka" % "akka-actor" % "1.2",    
    "org.specs2" %% "specs2" % "1.6.1",
    "org.specs2" %% "specs2-scalaz-core" % "6.0.1" % "test",    
    "junit" % "junit" % "4.10" % "test"
)

resolvers += "Typesafe Repository" at "http://repo.typesafe.com/typesafe/releases/"
  
// Single dependencies

//libraryDependencies += "org.jclouds" % "jclouds-all" % "1.1.1"


// Multiple dependencies example

//libraryDependencies ++= Seq(
//	"org.springframework" % "spring-core" % "3.0.6.RELEASE",
//	"org.springframework" % "spring-context" % "3.0.6.RELEASE"	
//)
