#pragma once

#ifdef DEBUG
#include <genesis.h>

void test_assert_str(int passed, const char *expected, const char *received,
                     const char * function, const char *file, int line
);
void test_assert_int(int passed, int expected, int received,
                     const char *function, const char *arquivo, int linha);
void test_assert_fix16(int passed, fix16 expected, fix16 received,
                       const char *function, const char *arquivo, int linha);
void print_test_results();

#define START_TESTS() kprintf("STARTING TESTS...\n")
#define END_TESTS() print_test_results()

#define ASSERT_INT(received, expected)                                         \
  do {                                                                         \
    test_assert_int((expected) == (received), expected, received, __FUNCTION__,    \
                    __FILE__, __LINE__);                                       \
  } while (0)

#endif

#define ASSERT_FIX16(received, expected)                                       \
  do {                                                                         \
    test_assert_fix16((expected) == (received), expected, received, __FUNCTION__,  \
                    __FILE__, __LINE__);                                       \
  } while (0)

#define ASSERT_TRUE(received)                                                    \
  do {                                                                           \
    test_assert_int(received, TRUE, received, __FUNCTION__, __FILE__, __LINE__); \
  } while (FALSE)

#define ASSERT_FALSE(received)                                                     \
  do {                                                                             \
    test_assert_int(!(received), FALSE, received, __FUNCTION__, __FILE__, __LINE__); \
  } while (FALSE)
