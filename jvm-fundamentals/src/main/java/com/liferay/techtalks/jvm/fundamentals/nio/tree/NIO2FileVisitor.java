package com.liferay.techtalks.jvm.fundamentals.nio.tree;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.FileVisitResult;
import java.nio.file.FileVisitor;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;

/**
 * The new {@link FileVisitor} interfaz available in Java 7
 * 
 * @author migue
 * 
 */
public class NIO2FileVisitor {

	private static class SimpleTreeVisitor extends SimpleFileVisitor<Path> {

		@Override
		public FileVisitResult preVisitDirectory(Path dir,
				BasicFileAttributes attrs) throws IOException {
			super.preVisitDirectory(dir, attrs);
			System.out
					.println("Include here your logic todo before visiting the directories");
			return FileVisitResult.CONTINUE;
		}

		@Override
		public FileVisitResult postVisitDirectory(Path dir,
				IOException exception) throws IOException {

			super.postVisitDirectory(dir, exception);

			System.out
					.println("Include here your logic todo after visiting the directories");

			return FileVisitResult.CONTINUE;
		}
	}

	protected static void visitHierarchy(String pathName) {
		Path path = Paths.get(pathName);

		try {
			Files.walkFileTree(path, new SimpleTreeVisitor());
		} catch (IOException e) {
			System.err.println("Error while traversing the hierarchy");
		}

	}

	/**
	 * @param args
	 * @throws Exception
	 */
	public static void main(String[] args) throws Exception {

		BufferedReader consoleInputStream = new BufferedReader(
				new InputStreamReader(System.in));

		System.out.println("Introduce a path file: ");
		String line = consoleInputStream.readLine();

		NIO2FileVisitor.visitHierarchy(line);
	}
}
