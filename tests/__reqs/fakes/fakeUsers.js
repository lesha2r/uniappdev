import FakeItems from './index.js';

const fakeUsers = new FakeItems('users');
fakeUsers.generate(10, (i) => {
// from 18 to 55
  const age = Math.floor(Math.random() * 37) + 18;

  const birthDate = new Date();
  birthDate.setFullYear(birthDate.getFullYear() - age);

  const monthOfBirth = Math.floor(Math.random() * 12);
  birthDate.setMonth(monthOfBirth);

  const dayOfBirth = Math.floor(Math.random() * 31);
  birthDate.setDate(dayOfBirth);

  const user = {
    name: `user${i}`,
    age,
    birthDate: birthDate,
    isActive: Math.random() > 0.5,
  };

  return user;
});

export default fakeUsers;
